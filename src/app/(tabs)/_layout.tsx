import React, { createContext, useContext, useRef, useState } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { BottomBar } from '@/components/ui/BottomBar';
import { AddExpenseSheet, AddExpenseSheetRef } from '@/components/sheets/AddExpenseSheet';
import { VoiceExpenseSheet, VoiceExpenseSheetRef } from '@/components/sheets/VoiceExpenseSheet';
import { NudgeCard } from '@/components/notifications/NudgeCard';
import { haptic } from '@/utils/haptics';
import type { NudgeResult } from '@/utils/nudgeEngine';

const AddExpenseContext = createContext<{ open: (catId?: string) => void }>({ open: () => {} });

export function useAddExpense() {
  return useContext(AddExpenseContext);
}

export default function TabsLayout() {
  const sheetRef = useRef<AddExpenseSheetRef>(null);
  const voiceSheetRef = useRef<VoiceExpenseSheetRef>(null);
  const [nudge, setNudge] = useState<NudgeResult | null>(null);

  const openSheet = (catId?: string) => {
    sheetRef.current?.present(catId);
  };

  return (
    <AddExpenseContext.Provider value={{ open: openSheet }}>
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={(props) => (
            <BottomBar
              {...props}
              onAddPress={openSheet}
              onMicPress={() => { haptic.medium(); voiceSheetRef.current?.present(); }}
            />
          )}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" />
        </Tabs>

        <NudgeCard nudge={nudge} onDismiss={() => setNudge(null)} />

        <AddExpenseSheet
          ref={sheetRef}
          onExpenseSaved={(n) => setNudge(n)}
        />
        <VoiceExpenseSheet
          ref={voiceSheetRef}
          onExpenseSaved={(n) => setNudge(n)}
          onEditFirst={(prefill) => {
            voiceSheetRef.current?.dismiss();
            setTimeout(() => sheetRef.current?.presentPrefilled(prefill), 350);
          }}
        />
      </View>
    </AddExpenseContext.Provider>
  );
}
