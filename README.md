# Luma — Expo Starter Template

A production-ready Expo starter for kicking off new React Native projects. Comes pre-configured with NativeWind, animations, fonts, storage, notifications, and a bottom sheet — so you skip the setup and go straight to building.

## Stack

| | Version |
|---|---|
| Expo SDK | 54 |
| React Native | 0.81.5 |
| Expo Router | 6 (file-based routing) |
| NativeWind | 4 (Tailwind CSS for RN) |
| React Native Reanimated | 4 |
| New Architecture | Enabled |

## Pre-installed Dependencies

| Package | Version | Purpose |
|---|---|---|
| `nativewind` + `tailwindcss` | 4 + 3 | Tailwind `className` on RN components |
| `react-native-reanimated` | ~4.1.1 | Animations |
| `react-native-gesture-handler` | ~2.28.0 | Gesture recognition (required by bottom-sheet) |
| `@gorhom/bottom-sheet` | 5.2.13 | Bottom sheet modal |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistent key-value storage |
| `expo-blur` | ~15.0.8 | Blur views |
| `expo-haptics` | ~15.0.8 | Haptic feedback |
| `expo-notifications` | ~0.32.17 | Local & push notifications |
| `expo-font` | ~14.0.11 | Custom font loading |
| `@expo-google-fonts/inter` | ^0.4.2 | Inter font (Regular, SemiBold, Bold) |
| `lottie-react-native` | ~7.3.1 | Lottie animations |
| `@react-native-community/datetimepicker` | 8.4.4 | Native date/time picker |

## Project Structure

```
├── src/
│   ├── app/                  # Expo Router screens
│   │   ├── _layout.tsx       # Root layout (fonts, gesture handler, bottom sheet provider)
│   │   └── (tabs)/
│   │       ├── _layout.tsx   # Tab bar config
│   │       ├── index.tsx     # Tab 1 — live demo of all dependencies
│   │       └── two.tsx       # Tab 2
│   ├── assets/
│   │   └── animations/       # Lottie JSON files
│   └── constants/
│       └── Colors.ts
├── global.css                # Tailwind directives entry point
├── tailwind.config.js
├── metro.config.js
└── babel.config.js
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start Metro (always reset cache after dependency changes)
pnpm start --reset-cache

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

## Key Setup Notes

- **NativeWind** — `className` works on all RN components via the Babel plugin in `babel.config.js`. No `cssInterop` calls needed.
- **Bottom sheet** — `BottomSheetModalProvider` wraps the root in `_layout.tsx`. Use `BottomSheetModal` + `useRef` in screens.
- **Fonts** — loaded in `_layout.tsx` via `useFonts`. Use `style={{ fontFamily: 'Inter_700Bold' }}` in any screen.
- **Notifications** — permission must be requested at runtime. iOS requires a physical device to receive notifications.
- **Haptics** — works on physical devices only, silently no-ops on simulator.

## Voice Assistant

Single mic tap → two possible outcomes:

```
┌────────────────────────────────────┬────────┬──────────────────────────────────────────┐
│              You say               │ Intent │                  Result                  │
├────────────────────────────────────┼────────┼──────────────────────────────────────────┤
│ "200 on coffee at Starbucks"       │ log    │ Shows ₹200 · Coffee · Starbucks → Log it │
│                                    │        │ / Edit                                   │
├────────────────────────────────────┼────────┼──────────────────────────────────────────┤
│ "bought clothes for 500"           │ log    │ Shows ₹500 · Shopping · notes: clothes   │
├────────────────────────────────────┼────────┼──────────────────────────────────────────┤
│ "how much did I spend on clothes?" │ query  │ Shows answer from your actual data       │
├────────────────────────────────────┼────────┼──────────────────────────────────────────┤
│ "what was my total last month?"    │ query  │ Summarises last month's spending         │
├────────────────────────────────────┼────────┼──────────────────────────────────────────┤
│ "how many times did I eat out      │ query  │ Counts from recent transactions          │
│  this week?"                       │        │                                          │
└────────────────────────────────────┴────────┴──────────────────────────────────────────┘
```

**How it works:** The LLM receives a compact context of your spending history (this month + last month + 3-month rollup + last 7 days daily + last 15 transactions) alongside the transcript. It decides the intent and either returns structured expense fields or writes a conversational answer. When ambiguous, it defaults to `log`.

The `query_result` UI shows a yellow chart icon, your question in muted text, the answer prominently, and an "Ask another" button that resets to idle.

Requires `EXPO_PUBLIC_GEMINI_API_KEY` or `EXPO_PUBLIC_OPEN_API_KEY` in `.env`. Switch providers by changing `PROVIDER` in `src/utils/parseVoiceExpense.ts`.

## Live Demo

Tab 1 (`src/app/(tabs)/index.tsx`) exercises every installed dependency:

- AsyncStorage read/write
- BlurView
- Haptic feedback button
- Local notification trigger
- Lottie animation
- Native date picker
- Bottom sheet modal
