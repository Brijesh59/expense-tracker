# @gorhom/bottom-sheet

A performant bottom sheet component built on top of Reanimated and Gesture Handler.

- **npm:** `@gorhom/bottom-sheet`
- **GitHub:** https://github.com/gorhom/react-native-bottom-sheet
- **Docs:** https://ui.gorhom.dev/components/bottom-sheet

---

## Setup

### 1. Provider

Wrap your root in `BottomSheetModalProvider`, inside `GestureHandlerRootView` and `SafeAreaProvider`.

```tsx
// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

function ThemedApp() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          {/* app content */}
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

> Order matters: `GestureHandlerRootView` → `SafeAreaProvider` → `BottomSheetModalProvider`.

---

## Core pattern: `BottomSheetModal` with `forwardRef`

All sheets in this project use `BottomSheetModal` (not plain `BottomSheet`) with an imperative ref API exposed via `forwardRef` + `useImperativeHandle`. This keeps presentation logic out of the parent.

```tsx
// components/sheets/MySheet.tsx
import { forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

export interface MySheetRef {
  present: () => void;
  dismiss: () => void;
}

export const MySheet = forwardRef<MySheetRef>((_, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['50%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#1A1A1A' }}
      handleIndicatorStyle={{ backgroundColor: '#444', width: 36 }}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* content */}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
```

**Using the sheet from a parent:**

```tsx
const sheetRef = useRef<MySheetRef>(null);

<MySheet ref={sheetRef} />
<Button onPress={() => sheetRef.current?.present()} />
```

---

## Snap points

`snapPoints` accepts an array of percentages or pixel values. The sheet opens to the first snap point.

```tsx
// Single snap — most common in this codebase
snapPoints={['85%']}   // AddExpenseSheet, CategoryFormSheet
snapPoints={['65%']}   // VoiceExpenseSheet
snapPoints={['48%']}   // BudgetFormSheet

// Dynamic snap points based on state (WorkspaceSheet)
snapPoints={mode === 'create' ? ['30%'] : ['40%']}

// Multiple snap points — user can drag between them
snapPoints={['40%', '80%']}
```

---

## Keyboard avoidance

Use these two props on `BottomSheetModal` whenever the sheet contains text inputs:

```tsx
<BottomSheetModal
  keyboardBehavior="interactive"   // sheet moves up with the keyboard
  keyboardBlurBehavior="restore"   // sheet returns to snap point when keyboard closes
  ...
>
```

- `keyboardBehavior="interactive"` — the sheet and keyboard animate together. Without this the sheet stays put and the keyboard can overlap the input.
- `keyboardBlurBehavior="restore"` — when the keyboard dismisses (user taps away or submits), the sheet snaps back to its snap point instead of staying at the raised position.

These props are used on every sheet that has text inputs: `AddExpenseSheet`, `BudgetFormSheet`, `CategoryFormSheet`, `WorkspaceSheet`.

---

## `BottomSheetTextInput`

Any `TextInput` inside a bottom sheet **must** be replaced with `BottomSheetTextInput` from `@gorhom/bottom-sheet`. Plain `TextInput` breaks gesture handling — tapping it can dismiss the sheet instead of focusing the input.

```tsx
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

// Drop-in replacement for TextInput — accepts the same props
<BottomSheetTextInput
  value={amount}
  onChangeText={setAmount}
  placeholder="0"
  placeholderTextColor={colors.textMuted}
  keyboardType="decimal-pad"
  autoFocus
  style={{
    fontFamily: Fonts.bold,
    fontSize: 48,
    color: colors.textPrimary,
    flex: 1,
  }}
/>
```

> See `AddExpenseSheet.tsx:221` and `WorkspaceSheet.tsx` for real usage.

---

## Scroll containers

Use the bottom-sheet-aware scroll containers inside `BottomSheetModal`. Plain `ScrollView` / `FlatList` / `View` break internal gesture detection.

| Use case | Component |
|---|---|
| General scrollable content | `BottomSheetScrollView` |
| Long lists | `BottomSheetFlatList` |
| Fixed-height, non-scrolling content | `BottomSheetView` |

```tsx
// Scrollable form (AddExpenseSheet, BudgetFormSheet, WorkspaceSheet)
<BottomSheetScrollView
  keyboardShouldPersistTaps="handled"
  contentContainerStyle={{ paddingBottom: 40 }}
>
  ...
</BottomSheetScrollView>

// Fixed content (VoiceExpenseSheet)
<BottomSheetView>
  ...
</BottomSheetView>
```

`keyboardShouldPersistTaps="handled"` lets taps on buttons inside the scroll view register even when the keyboard is open, instead of just dismissing the keyboard.

---

## Backdrop

Wrap the backdrop renderer in `useCallback` to avoid re-renders.

```tsx
const renderBackdrop = useCallback(
  (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}   // fully transparent when sheet is dismissed
      appearsOnIndex={0}        // visible as soon as sheet reaches first snap point
      opacity={0.6}             // optional, default is 0.5
    />
  ),
  []
);

<BottomSheetModal backdropComponent={renderBackdrop} ...>
```

---

## Passing data into a sheet

For sheets that need data (e.g. edit mode), extend the ref interface and set state before calling `present()`:

```tsx
export interface AddExpenseSheetRef {
  present: (prefilledCategoryId?: string) => void;
  presentEdit: (transaction: Transaction) => void;
  dismiss: () => void;
}

useImperativeHandle(ref, () => ({
  present: (prefilledCategoryId?: string) => {
    setEditingTransaction(null);
    setAmount('');
    sheetRef.current?.present();
  },
  presentEdit: (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(String(transaction.amount));
    sheetRef.current?.present();
  },
  dismiss: () => sheetRef.current?.dismiss(),
}));
```

> See `AddExpenseSheet.tsx:26–101` for the full pattern with `present`, `presentPrefilled`, and `presentEdit`.

---

## `onDismiss` callback

Use `onDismiss` on the modal to run cleanup when the sheet closes (including swipe-to-dismiss):

```tsx
<BottomSheetModal
  onDismiss={() => {
    stopRecording();
    resetState();
  }}
  ...
>
```

> See `VoiceExpenseSheet.tsx` for usage.

---

## Common `BottomSheetModal` props reference

| Prop | Type | Notes |
|---|---|---|
| `ref` | `RefObject<BottomSheetModal>` | Required for imperative API |
| `snapPoints` | `(string \| number)[]` | e.g. `['50%']`, `['40%', '80%']` |
| `enablePanDownToClose` | `boolean` | Allow swipe-down to dismiss |
| `keyboardBehavior` | `'interactive' \| 'extend' \| 'fillParent'` | Use `"interactive"` with text inputs |
| `keyboardBlurBehavior` | `'none' \| 'restore'` | Use `"restore"` to snap back after keyboard closes |
| `backdropComponent` | `BottomSheetBackdropProps => ReactNode` | Dim overlay behind sheet |
| `backgroundStyle` | `StyleProp<ViewStyle>` | Sheet background color / border radius |
| `handleIndicatorStyle` | `StyleProp<ViewStyle>` | The drag handle pill |
| `onDismiss` | `() => void` | Fires after the sheet fully closes |
