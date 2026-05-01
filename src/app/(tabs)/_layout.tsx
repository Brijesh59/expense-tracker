import React, { createContext, useContext, useRef, useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { TabBar } from '@/components/ui/TabBar';
import { AddExpenseSheet, AddExpenseSheetRef } from '@/components/sheets/AddExpenseSheet';
import { NudgeCard } from '@/components/notifications/NudgeCard';
import { Colors, Fonts } from '@/constants/theme';
import { springs } from '@/constants/animations';
import { haptic } from '@/utils/haptics';
import type { NudgeResult } from '@/utils/nudgeEngine';

const AddExpenseContext = createContext<{ open: (catId?: string) => void }>({ open: () => {} });

export function useAddExpense() {
  return useContext(AddExpenseContext);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TabsLayout() {
  const sheetRef = useRef<AddExpenseSheetRef>(null);
  const [nudge, setNudge] = useState<NudgeResult | null>(null);
  const fabScale = useSharedValue(1);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const openSheet = (catId?: string) => {
    sheetRef.current?.present(catId);
  };

  return (
    <AddExpenseContext.Provider value={{ open: openSheet }}>
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="transactions" />
          <Tabs.Screen name="budgets" />
          <Tabs.Screen name="insights" />
          <Tabs.Screen name="settings" />
        </Tabs>

        {/* Global FAB */}
        <AnimatedPressable
          onPressIn={() => {
            fabScale.value = withSpring(0.9, springs.snappy);
            haptic.medium();
          }}
          onPressOut={() => {
            fabScale.value = withSpring(1, springs.bouncy);
          }}
          onPress={() => openSheet()}
          style={[
            fabStyle,
            {
              position: 'absolute',
              bottom: 72,
              alignSelf: 'center',
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            },
          ]}
        >
          <Text style={{ color: '#fff', fontSize: 28, fontFamily: Fonts.regular, lineHeight: 32 }}>
            +
          </Text>
        </AnimatedPressable>

        {/* Post-expense nudge card */}
        <NudgeCard nudge={nudge} onDismiss={() => setNudge(null)} />

        {/* Sheet */}
        <AddExpenseSheet
          ref={sheetRef}
          onExpenseSaved={(n) => setNudge(n)}
        />
      </View>
    </AddExpenseContext.Provider>
  );
}
