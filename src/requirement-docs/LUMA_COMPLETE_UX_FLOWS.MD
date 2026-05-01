🌕 Luma — Complete UX Flow (All Tabs)
🧭 GLOBAL UX RULES (apply everywhere)
FAB (+) is always visible → opens Add Expense
Month context is global (affects Overview, Budgets, Insights)
All feedback = immediate + contextual
Navigation = tab-based, no deep nesting
🏠 1. OVERVIEW (Home / Default Tab)
🎯 Purpose

Quick clarity. Zero thinking.

🖥️ Layout
[Top Bar]
Month selector (Apr 2026)

[Budget Ring]
62% used
₹12,400 spent / ₹20,000

[Quick Insight Line]
“Spending is slightly higher this week”

[Category Budgets List]
Food     ███████░░  ₹4,200 / ₹6,000
Travel   ███░░░░░░  ₹1,200 / ₹5,000

[FAB +]
🔁 Interactions
1. Tap Month

→ Bottom sheet opens
→ Select month
→ Screen updates with fade + number animation

2. Tap Category Card

→ Slide up → Category Detail View (inline / partial screen)

🧩 Category Detail (Overlay View)
Food

[Usage]
₹4,200 / ₹6,000

[Mini Chart]
Last 7 days

[Transactions List]
Exit:
Swipe down OR tap outside
⚡ Dynamic Behavior
Budget ring animates on load
Insight line changes based on triggers
Categories reorder based on:
closest to limit OR highest spend
🚨 Edge States
No budgets:

Replace ring with:

“Set your first budget”

CTA → opens Budget flow

💳 2. TRANSACTIONS
🎯 Purpose

Detailed tracking + control

🖥️ Layout
[Search Bar]
“Search expenses”

[Category Filters - horizontal]
All | Food | Travel | Shopping

[List]

Today
Swiggy     ₹250
Uber       ₹180

Yesterday
Zara       ₹1,200
🔁 Interactions
1. Scroll
Infinite scroll (paginated)
2. Tap Transaction

→ Bottom sheet opens (NOT full page)

Amount: ₹250
Category: Food
Merchant: Swiggy
Date: Today

[Edit]   [Delete]
3. Edit Flow
Inline editable fields
Save → sheet closes → list updates instantly
4. Delete
Swipe left → reveal delete
OR
Delete button inside sheet
5. Filter
Tap category chip → updates list instantly (no reload feel)
⚡ Micro UX
New transaction appears with slight highlight
Amount animates (subtle count-up)
🚨 Edge States
Empty:

“No expenses yet”
CTA → Log expense

➕ 3. ADD EXPENSE (GLOBAL FLOW)
🎯 Purpose

Fastest action in app

🖥️ Entry Points
FAB (+)
After onboarding
From empty states
UI: Bottom Sheet (same everywhere)
₹ [Amount]  ← autofocus

Category (horizontal scroll)
Food | Travel | Shopping

Merchant
[________]

Date
Today

[Save]
🔁 Interactions
1. Open
Sheet slides up
Keyboard opens immediately
2. Category selection
Tap → instant switch (no dropdown)
3. Save

👉 Sequence:

Sheet closes
Insight card appears
Underlying screen updates
⚡ Smart Defaults
Last used category
Last payment method (future)
Today’s date
🚨 Edge Cases
No category → auto-select default
Large amount → no friction, just log
📁 4. BUDGETS
🎯 Purpose

Planning + control

🖥️ Layout
[Header]
Budgets

[Month Selector]

[Category List]
Food     ₹4,200 / ₹6,000
Travel   ₹1,200 / ₹5,000

[+ Add Budget]
🔁 Interactions
1. Tap Category

→ Slide up → Category Detail (same component as Overview)

2. Add Budget

→ Bottom sheet opens

Category
[Select]

Budget amount
₹ [____]

[Save]
3. Edit Budget
Tap category → edit inline OR via sheet
⚡ Behavior
Categories sorted by:
highest usage %
Progress bars animate
🚨 Edge States
Empty:

“Set a budget to guide your spending”
CTA → Add budget

📊 5. INSIGHTS
🎯 Purpose

Patterns, not raw data

🖥️ Layout
[Month Selector]

[Top Summary]
₹12,400 spent
+12% vs last month

[Donut Chart]
Category split

[Daily Chart]
Spending trend

[Insight Cards]
“Most spending happens on weekends”
“Dining is your biggest category”
🔁 Interactions
1. Scroll
Vertical stack
Cards reveal progressively
2. Tap Insight Card (optional v2)

→ Deep dive view (later)

3. Change Month

→ Charts animate update

⚡ Behavior
Charts animate on first load
Insights rotate (1–2 visible max)
🚨 Edge States
No data:

“Start logging to see insights”

⚙️ 6. SETTINGS
🎯 Purpose

Minimal control

🖥️ Layout
Currency
₹ INR

Reset Data

(Advanced later)
Export
🔁 Interactions
Simple tap → select / confirm
🔗 CROSS-TAB CONNECTIONS (IMPORTANT)
1. Add Expense → Everywhere
Updates:
Overview
Budgets
Transactions
Insights

👉 All via optimistic UI

2. Category Tap (Unified Pattern)
Same detail view used in:
Overview
Budgets

👉 Reusable UX = consistency

3. Month Context
Changing month affects:
Overview
Budgets
Insights

NOT:

Transactions (unless filtered)
⚡ GLOBAL FEEDBACK SYSTEM
Every action → feedback
Action	Feedback
Add expense	Insight card
Edit	Subtle toast
Delete	Undo option
Budget change	Progress animation
🎯 PRIMARY USER LOOP

This is what you’re optimizing:

Open app → See status → Add expense → Get feedback → Repeat
🧠 ADVANCED (SUBTLE BUT POWERFUL)
1. Attention Guidance
Use motion to guide:
ring animation
progress fill
card slide
2. Information Hierarchy

Always:

Status (top)
Insight (1 line)
Details (below)
3. Limit Cognitive Load
Max 1–2 insights visible
No cluttered charts
🏆 Final Product Truth

If built like this, Luma becomes:

“The fastest way to understand your money in under 10 seconds”