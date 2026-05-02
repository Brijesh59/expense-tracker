# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm start            # Start Expo dev server
pnpm start --reset-cache  # Start with cleared Metro cache
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android emulator
pnpm web              # Run in browser
```

No test runner or linter is configured in this project.

## Environment variables

Create a `.env` file in the project root (it is gitignored):
```
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```
Used by the voice expense parser (`src/utils/parseVoiceExpense.ts`) to call Gemini 2.0 Flash Lite for structured extraction from speech transcripts.

## Architecture

Luma is a React Native expense tracker built with **Expo SDK 54**, **Expo Router 6** (file-based routing), **NativeWind 4** (Tailwind for RN), **Zustand** state management, and **AsyncStorage** persistence. TypeScript path alias `@/*` maps to `./src/*`.

### Data flow

```
AsyncStorage (db/storage.ts)
  ↑↓
Zustand store (db/store.ts)   ← all CRUD actions live here
  ↓
Custom hooks (hooks/)         ← derived calculations (budgets, insights, filters)
  ↓
Screen components             ← subscribe to hooks, dispatch to store
```

### Key data models (`db/types.ts`)

- `Transaction` — amount, categoryId, merchant, date, paymentMethod, notes
- `Budget` — categoryId, amount, month, year
- `Category` — name, icon (emoji), color, isDefault
- `Settings` — key-value pairs (currency, etc.)

### Navigation

Root layout (`app/_layout.tsx`) checks `Storage.hasLaunched()` on first mount:
- First launch → onboarding flow (`app/onboarding/`)
- Returning user → tab layout (`app/(tabs)/`) with 5 tabs + FAB

Global selected month lives in `store/monthStore.ts` — all budget and insights calculations filter by it.

### Adding expenses

The FAB in `app/(tabs)/_layout.tsx` opens `AddExpenseSheet`. After save, `nudgeEngine.ts` evaluates the new transaction and may show a `NudgeCard` with a contextual insight.

### Styling conventions

NativeWind is configured globally — use `className` on all React Native components without `cssInterop`. Dark theme only: background `#0D0D0D`, surface `#1A1A1A`, primary yellow `#F8E71C`. Fonts are Inter (400–700). Animations use React Native Reanimated 4 with spring configs from `constants/animations.ts`.

### Notable constraints

- Haptics and push notifications only work on physical devices, not simulators.
- `BottomSheetModalProvider` wraps the root — all bottom sheets must be `BottomSheetModal` (not plain `BottomSheet`).
- Product copy and tone guidance are in `src/requirement-docs/` — consult `PERSONALITY.md` and `COPY.md` when writing UI strings.
