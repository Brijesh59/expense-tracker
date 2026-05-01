🌕 Luma Onboarding — UX Flow (Execution Ready)
🧭 Core UX Principles (applied throughout)
Bottom sheets > full screens (faster, less friction)
Pre-fill everything possible
One primary action per screen
Micro-animations = feedback, not decoration
🪜 FLOW MAP (High Level)
Launch → Welcome → (Optional Intent) → Set Budget → Add Expense → Insight → Dashboard
🧩 1. APP LAUNCH
Screen: Splash → Welcome
Transition:
Splash (logo) → fade (300ms)
Welcome slides up
🖥️ Welcome Screen

UI:

Centered headline
Minimal illustration (soft gradient / abstract)

CTA (bottom fixed):

“Get started”
Interaction:

👉 Tap “Get started”

Transition:
Slide left → next screen (native feel)
🧩 2. INTENT SCREEN (Optional)
UI:
Question at top
3 selectable chips
“Continue” CTA (disabled until selection OR allow skip)
Interaction:
Tap option → subtle highlight
Tap continue
Transition:
Slide left → Budget screen
🧩 3. SET FIRST BUDGET (CRITICAL SCREEN)
UI Structure
[Header]
“Let’s set a simple budget”

[Category selector - horizontal pills]
🍔 Food (selected)
🚕 Transport
🛍 Shopping

[Amount Input - BIG]
₹ [____]

[Helper text]
“Most people start here”

[CTA - bottom sticky]
Set budget
Behavior
Default state:
Category = Food (pre-selected)
Amount = empty but placeholder shown
Interaction:
Case 1: User enters amount → taps CTA

→ Proceed

Case 2: User does nothing

→ CTA disabled until amount entered

Transition:

👉 On “Set budget”

Button press → slight scale (0.95 → 1)
Screen slides down
Add Expense opens as bottom sheet

👉 Important:
Don’t go full new screen — keep momentum

🧩 4. ADD EXPENSE (BOTTOM SHEET)
UI (Bottom Sheet - 80% height)
[Handle]

Amount (auto-focused)
₹ [200]

Category (pre-filled)
Food

Merchant (optional)
[________]

[Save button]
Behavior
On open:
Keyboard auto opens
Cursor active in amount field
Interaction:
Fast path (ideal):
Enter amount → tap “Save”
Slow path:
Change category / merchant
Micro UX:
Last typed number animates slightly (feedback)
Save button activates only when amount exists
Transition (VERY IMPORTANT)

👉 On Save:

Bottom sheet slides down
Immediate feedback card slides up from bottom
🧩 5. FIRST INSIGHT (MAGIC MOMENT)
UI: Floating Insight Card

Position:

Bottom → slightly above CTA area
Content:
“This uses 4% of your food budget”

“You’re off to a good start 👍”
Behavior:
Slides up (spring animation)
Stays for ~2.5 sec
Then gently fades OR collapses into dashboard

👉 Optional:
Small progress ring animation updates behind

🧩 6. DASHBOARD (FIRST LANDING)
Transition:
Background scales slightly (subtle zoom out feel)
Full dashboard appears
UI Highlights
A. Budget Ring
Animates from 0% → current %
B. Category Card
Food category shows:
spent
progress bar (animated fill)
C. Top Message (contextual)
“Here’s your month so far”
“You’ve logged your first expense”
D. Floating CTA
“+” button persists
🧩 7. GUIDED NUDGE (Optional but HIGH IMPACT)

After 2–3 seconds:

👉 Small tooltip near FAB:

“Try adding one more”

Behavior:
Shows once
Disappears on interaction
🧩 8. EXIT POINT (IMPORTANT)

User can now:

Explore dashboard
Tap “+” again
Navigate tabs

👉 No forced steps anymore

⚡ KEY TRANSITIONS SUMMARY
1. Screen → Screen
Slide left/right (native feel)
2. Screen → Action
Prefer bottom sheet
Keeps context intact
3. Action → Feedback
Always immediate (no silent success)
4. Feedback → State Update
Animate numbers + progress
🎯 IDEAL USER PATH (TIME)
Step	Time
Welcome → Budget	10 sec
Budget set	20 sec
Expense added	40 sec
Insight seen	50 sec
Dashboard	< 60 sec
🚫 UX MISTAKES TO AVOID
❌ Full-page transitions everywhere

Feels heavy → drop-off

❌ Asking too much upfront

No:

multiple categories
income
goals
❌ No feedback after save

Biggest mistake → kills “aha moment”

💡 Subtle but Important Details
1. Use motion to guide
Things appear where attention should go
2. Always show progress
Even 2% usage matters
3. Keep user in flow
No “back” feeling
Always forward momentum
🏆 Final UX Philosophy

This onboarding should feel like:

“I already started using Luma”

Not:

“I just finished setting it up”