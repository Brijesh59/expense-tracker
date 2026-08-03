# Next Features

## Budget System Direction

### Decision: one budget set per workspace

Luma already has workspaces, and this is the right mental model for separate money contexts.

Use workspaces for things like:

- Personal
- Household
- Japan Trip
- Business
- Family Support

Each workspace should have its own budget setup, categories, transactions, and insights. That keeps the product simple: instead of creating many unrelated budget containers inside one workspace, the user creates a workspace for each real-life context.

Recommended copy:

- "Create workspace"
- "Personal"
- "Household"
- "Japan Trip"
- "Switch workspace"

Avoid copy like "budget group" or "budget profile" unless we later find that workspaces are not enough.

## Recurring Monthly Budgets

### Current problem

Budgets are currently month-specific. The `Budget` model has `month` and `year`, so a budget created in one month does not naturally carry into the next month.

This creates a bad user experience:

- The user has to recreate the same budget every month.
- Routine categories like rent, grocery, bills, and transport feel broken after the month changes.
- The selected month UI becomes harder to trust because some months have missing budgets.

### Desired behavior

When a user creates a budget, it should continue every month by default.

Example:

- User sets Grocery to Rs. 6,000 in August.
- September should automatically show Grocery as Rs. 6,000.
- October should also show Grocery as Rs. 6,000.
- If the user changes September only, that should not necessarily rewrite every month unless they choose to update the recurring budget.

## Proposed Model

Move from month-specific budgets to recurring budget rules with optional monthly overrides.

### BudgetRule

Use this for the default ongoing budget.

```ts
interface BudgetRule {
  id: string;
  workspaceId: string;
  categoryId: string;
  amount: number;
  startsMonth: number;
  startsYear: number;
  endsMonth?: number;
  endsYear?: number;
  createdAt: number;
  updatedAt?: number;
}
```

### BudgetOverride

Use this only when a specific month needs a different amount.

```ts
interface BudgetOverride {
  id: string;
  workspaceId: string;
  categoryId: string;
  month: number;
  year: number;
  amount: number;
  createdAt: number;
  updatedAt?: number;
}
```

### Effective budget lookup

For a selected workspace, month, and category:

1. Check if a `BudgetOverride` exists for that month.
2. If yes, use the override amount.
3. If no, use the active `BudgetRule`.
4. If no active rule exists, show no budget for that category.

This gives the user a stable monthly budget without losing flexibility.

## UX Recommendation

When setting or editing a budget, show a small choice:

- "Every month" default
- "This month only"

For editing an existing recurring budget:

- "Update every month"
- "Update this month only"

Keep the copy calm and simple. No financial jargon.

Suggested microcopy:

- "Use this every month"
- "Only for this month"
- "This month's budget is different"
- "Future months will use Rs. 6,000"

## Migration Plan

Current existing budgets can be migrated safely:

1. For each workspace, read existing `Budget[]`.
2. Group budgets by `categoryId`.
3. For each category, use the latest budget amount as the new recurring `BudgetRule`.
4. Preserve older month-specific budgets as `BudgetOverride` only if their amount differs from the new recurring amount.
5. Keep a migration backup key in AsyncStorage until the new budget system is stable.

## Implementation Checklist

- Add `BudgetRule` and `BudgetOverride` types.
- Add storage keys per workspace for budget rules and overrides.
- Update Zustand store actions:
  - `addBudgetRule`
  - `updateBudgetRule`
  - `deleteBudgetRule`
  - `setBudgetOverride`
  - `deleteBudgetOverride`
  - `getEffectiveBudget`
- Update hooks that calculate budget usage to use effective budgets for the selected month.
- Update the budget screen UI to support "Every month" and "This month only".
- Add migration from current month-specific budgets.
- Update seed data to create recurring budget rules instead of one-month budgets.

## AI Expense Search and Query Understanding

### Current problem

Voice/chat queries do not reliably understand whether the user is asking about a category, payment method, note, merchant, workspace, month, or budget.

Example problem query:

> "How much have I spent overall in UPI?"

UPI is not a spending category. It is a payment method. The assistant should understand that and answer using `paymentMethod = "upi"` instead of trying to match UPI as a category.

The same applies to:

- Cash
- Card
- UPI
- Wallet
- Bank transfer

These should be interpreted as payment methods when the app has them in the payment method list.

### Desired behavior

The AI/query layer should search and reason across:

- Transaction amount
- Category
- Payment method
- Merchant
- Notes
- Selected month
- Explicit month mentioned in the query
- Current workspace
- Explicit workspace mentioned in the query
- Budget amount and budget usage

The assistant should be able to answer questions like:

- "How much did I spend through UPI this month?"
- "Show card spends for July."
- "How much cash did I use in Household?"
- "What did I spend on groceries in Japan Trip?"
- "Find expenses where I wrote medicine in notes."
- "How much is left in my food budget?"
- "Which category is closest to budget this month?"
- "Did I go over any budget in Personal?"

### Query interpretation rules

Use known app metadata before guessing:

1. Match against payment methods first when the term is one of the known payment methods.
2. Match against categories when the term is a known category.
3. Match against workspace names when the term is a known workspace.
4. Match against merchants and notes using fuzzy text search.
5. Use the selected month/year when the query does not mention a time period.
6. Use the current workspace when the query does not mention a workspace.
7. If a term could mean more than one thing, ask a short clarification.

Example clarification:

> "Do you mean UPI as a payment method?"

### Query result requirements

Every answer should be based on a structured filter object before generating text.

Example:

```ts
interface ExpenseQueryFilter {
  workspaceId: string;
  month?: number;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  categoryIds?: string[];
  paymentMethods?: string[];
  merchantSearch?: string;
  notesSearch?: string;
  minAmount?: number;
  maxAmount?: number;
  includeBudgetContext?: boolean;
}
```

The assistant should not directly answer from raw text interpretation. It should:

1. Parse user text into `ExpenseQueryFilter`.
2. Run the filter against local transactions.
3. Calculate totals/counts/budget usage.
4. Generate a calm answer from the verified result.

### Budget-aware answers

For budget-related queries, include:

- Budget amount for the selected month
- Spent amount
- Amount left
- Whether the category is under, close to, or over budget

Example:

> "Food is at Rs. 4,800 of Rs. 6,000 this month. You have Rs. 1,200 left."

### Implementation Checklist

- Define known payment methods as structured constants, not free text.
- Add a query parser that maps spoken text to `ExpenseQueryFilter`.
- Add fuzzy matching for category names, merchants, workspace names, and notes.
- Add payment-method disambiguation for UPI, cash, card, wallet, and bank transfer.
- Make selected month/year and current workspace the default query context.
- Support explicit month and workspace overrides from the query.
- Add budget context to query results when the user asks about left/over/limit/budget.
- Add test fixtures for UPI/card/cash queries.
- Add fallbacks that ask one short clarification when the query is ambiguous.

## Quick Capture via iPhone Back Tap and Shortcuts

### Feature idea

Let the user log an expense without manually opening Luma, finding the plus button, and navigating through the full add-expense flow.

The desired experience:

1. User double-taps the back of their iPhone.
2. iOS runs a Luma shortcut.
3. Luma opens directly into a quick expense capture surface.
4. User can speak, type, or confirm a parsed expense.
5. Expense is saved to the current/default workspace.

This should feel like a small capture layer, not the full app.

### iOS reality check

iPhone Back Tap can run a Shortcut. Luma should expose a Shortcut/App Intent such as:

- "Log expense"
- "Speak expense"
- "Open quick capture"

The practical implementation is likely one of these:

- Back Tap -> Shortcut -> open Luma deep link to quick capture screen
- Back Tap -> Shortcut -> run Luma App Intent to log a structured expense
- Back Tap -> Shortcut -> open Luma voice capture

Do not assume iOS will allow Luma to show a true floating overlay above every other app. The safer design is a very fast deep-linked screen or native Shortcut/App Intent.

### Quick capture UX

The quick capture screen should be minimal:

- Amount field
- Merchant/note field
- Category selector
- Payment method selector
- Workspace selector
- Mic button for speech input
- Save button

Default values should reduce friction:

- Default workspace: current workspace or user-selected default workspace
- Default payment method: last used payment method
- Default date: today
- Category: inferred from text when possible

Suggested copy:

- "Log expense"
- "Speak expense"
- "Saved"
- "Need one detail"
- "Which workspace?"

### Speech examples

The quick capture parser should support:

- "Spent 450 on coffee by UPI"
- "Paid 2,000 for groceries with card"
- "Cash 120 for parking"
- "Add 6,000 rent in Household"
- "Japan trip, 1,200 for train tickets"

### Implementation options

#### Phase 1: Deep link quick capture

Add a route like:

```txt
luma://quick-capture
```

Back Tap can run a Shortcut that opens this deep link.

This is the fastest version and should work well for the first release.

#### Phase 2: App Intent / App Shortcut

Expose native iOS actions through App Intents:

- `LogExpenseIntent`
- `OpenQuickCaptureIntent`
- `SpeakExpenseIntent`

This makes Luma available to Shortcuts, Siri, Spotlight, widgets, and potentially other Apple system surfaces.

#### Phase 3: Widget / Lock Screen / Action Button

Add additional capture entry points:

- Home Screen widget
- Lock Screen widget
- Control Center action if available
- Action Button shortcut for supported iPhones

### Implementation Checklist

- Add a dedicated quick capture screen in the app.
- Add a deep link route for quick capture.
- Add onboarding/help copy that explains iOS Back Tap setup.
- Add default workspace setting for quick capture.
- Add last-used payment method as a default.
- Reuse the existing voice expense parser.
- Add App Intent support when moving beyond Expo-only constraints.
- Add a Shortcut setup guide for users.
- Track whether quick capture saves successfully or needs confirmation.

### References

- Apple Back Tap support: https://support.apple.com/guide/iphone/back-tap-iphaa57e7885/ios
- Apple App Intents documentation: https://developer.apple.com/documentation/appintents
- Creating your first App Intent: https://developer.apple.com/documentation/appintents/creating-your-first-app-intent
- Apple App Shortcuts HIG: https://developer.apple.com/design/human-interface-guidelines/app-shortcuts

## Open Questions

- Should trip workspaces have an optional end month by default?
- Should a workspace support a total monthly budget in addition to category budgets?
- Should shared workspaces require Luma Plus from the start, or only when inviting a second member?
- Should AI be allowed to create budgets, or only suggest them for user confirmation?
- Should payment method names be customizable per workspace?
- Should notes search support synonyms, such as "medicine" matching "pharmacy"?
- Should quick capture always save to the current workspace, or should users choose a default quick-capture workspace?
- Should quick capture allow one-tap save after AI parsing, or always require confirmation?
