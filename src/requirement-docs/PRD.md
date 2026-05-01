📄 PRD — Luma (v1)

A mobile-first budget & expense tracking app focused on clarity and control

1. 🧭 Product Vision

Luma helps users build awareness of their spending habits through simple input and highly visual feedback.

“Clarity over complexity.”

2. 📱 Navigation Structure

Bottom navigation (fixed across app):

Overview
Transactions
Budgets
Insights
Settings
🏠 3. OVERVIEW (Dashboard)
🎯 Purpose

Provide a quick, at-a-glance understanding of the user’s financial status for the current month.

🧩 Components & Behavior
3.1 Budget Usage Indicator (Top)

What it shows:

Percentage of total budget used (e.g., 62%)
Total spent vs total budget
Remaining amount

Why it matters:

Instant awareness → “Am I overspending?”

Behavior:

Updates in real-time as transactions are added
Color states:
<70% → Neutral
70–90% → Warning

100% → Critical (over budget)

3.2 Summary Stats

Displays:

Total spent (month-to-date)
Total remaining budget

Behavior:

Always aligned with selected month (default = current)
3.3 Active Budgets (Category List)

What it shows:

Categories with budgets (e.g., Groceries, Transport)
Progress bar per category
Spent vs allocated amount

Why it matters:

Users don’t think in totals — they think in categories

Behavior:

Sorted by:
Highest spend OR closest to limit
Visual emphasis on:
Categories near/exceeding budget
3.4 Add Expense CTA (Floating Button)

Purpose:

Primary action of the app

Behavior:

Persistent and easily accessible
Opens “Add Expense” flow instantly
3.5 Empty State

If no budgets exist:

Show onboarding prompt:

“Set your first budget to start tracking”

💳 4. TRANSACTIONS
🎯 Purpose

Provide a detailed, chronological view of all expenses and enable quick tracking.

🧩 Components & Behavior
4.1 Transaction List

Displays:

Merchant name
Category
Amount
Time/date

Grouping:

By date (Today, Yesterday, etc.)
4.2 Search & Filters

Search:

By merchant name

Filters:

Category chips (e.g., Food, Shopping, Utilities)

Why it matters:

Users recall spending contextually (“Where did I spend?”)
4.3 Transaction Item

Tap Behavior:

(v1 optional) View/edit details
4.4 Empty State
“No transactions yet”
CTA: Add first expense
➕ 5. ADD EXPENSE (Core Flow)
🎯 Purpose

Enable fast, frictionless expense logging

🧩 Components
5.1 Amount Input
Primary focus
Large, clear numeric input
5.2 Category Selection
Predefined categories
Quick tap selection
5.3 Merchant Input
Optional
Free text
5.4 Date Picker
Default: Today
Editable
5.5 Payment Method
Dropdown (e.g., Cash, Card, UPI)
5.6 Notes
Optional
⚡ UX Principles
Minimal taps (≤3 ideal)
Auto-focus on amount
Remember last used category/payment
Fast open/close
📁 6. BUDGETS
🎯 Purpose

Help users plan and control spending per category

🧩 States & Components
6.1 Empty State (First-Time User)

Displays:

Illustration + message
CTA: “Set your first budget”
6.2 Budget List (Main View)

Displays:

Category-wise budget cards
Progress bars
Spent vs limit

Behavior:

Highlights:
Near-limit categories
Over-budget categories
6.3 Category Detail View

Displays:

Budget usage (amount + %)
Remaining amount
Weekly spending trend (line graph)
Recent transactions (filtered)

Why it matters:

Drill-down into problem areas
6.4 Create Category + Budget

Inputs:

Category name
Icon
Monthly budget amount
6.5 Smart Suggestion (Light AI)

Displays:

Suggested budget amount
Based on past spending (if available)
🧠 UX Insight

Users think:

“I overspent on food”

NOT:

“My total monthly spend increased”

So budgets must feel category-first, not system-first

📊 7. INSIGHTS
🎯 Purpose

Turn raw data into understandable patterns and behavior insights

🧩 Components
7.1 Top Summary
Total spent
Total saved (if applicable)
% change vs last month
7.2 Spending Breakdown (Donut Chart)

Displays:

Category distribution (%)

Why it matters:

Shows where money goes
7.3 Daily Spending Chart

Displays:

Spending per day (weekly view)

Why it matters:

Identifies spikes and patterns
7.4 Monthly Comparison

Displays:

Current vs previous month
% increase/decrease
7.5 Biggest Expense Highlight

Displays:

Largest transaction
Context (merchant, category)

Why it matters:

Anchors user memory
📅 Month Selector
Allows switching between months
Updates all insights dynamically
⚙️ 8. SETTINGS
🎯 Purpose

Basic user controls (minimal in v1)

🧩 Features
Currency selection
Reset data (danger zone)
(Optional later) Export data
🧑‍🤝‍🧑 9. MULTI-USER (Future Consideration Only)

(Not part of v1 UI but important for design thinking)

Concept
“Workspace” = shared financial space (family, couple)
Expected Capabilities
Shared transactions
Shared budgets
Individual contribution visibility
Roles (owner/member)
Key Product Challenge

Attribution vs simplicity

Avoid making it feel like:

Splitwise (too complex)
Or single-user (too limited)
📈 10. SUCCESS METRICS
Activation
User sets at least 1 budget
User adds ≥1 expense
Engagement
Regular expense logging (daily/weekly)
Retention
User returns to check dashboard/insights
Core Metric

“Monthly active users who log ≥10 transactions”

💡 Final Product Note (Important)

This product will live or die on 2 things:

1. ⚡ Speed of logging

If adding expense feels slow → app dies

2. 👁️ Clarity of insights

If user doesn’t feel smarter → no retention