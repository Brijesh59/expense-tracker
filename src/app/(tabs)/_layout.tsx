import React, { createContext, useContext, useRef, useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
const AnimatedView = Animated.createAnimatedComponent(View);

const FAB_SIZE = 52;
const SHADOW_OFFSET = 4;

export default function TabsLayout() {
  const sheetRef = useRef<AddExpenseSheetRef>(null);
  const [nudge, setNudge] = useState<NudgeResult | null>(null);
  const insets = useSafeAreaInsets();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(1);

  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const shadowAnimStyle = useAnimatedStyle(() => ({
    opacity: shadowOpacity.value,
  }));

  const openSheet = (catId?: string) => {
    sheetRef.current?.present(catId);
  };

  // Tab bar height: safe area bottom + top padding (10) + icon (~18) + gap (4) + label (~10) + indicator (2) + padding (10)
  const tabBarHeight = (insets.bottom > 0 ? insets.bottom : 8) + 56;
  const fabBottom = tabBarHeight + 16;

  return (
    <AddExpenseContext.Provider value={{ open: openSheet }}>
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="transactions" />
          <Tabs.Screen name="budgets" />
          <Tabs.Screen name="insights" />
          <Tabs.Screen name="settings" />
        </Tabs>

        {/* neoPOP FAB — right-anchored to avoid overlapping Budgets tab */}
        <View
          style={{
            position: 'absolute',
            bottom: fabBottom,
            right: 20,
            width: FAB_SIZE + SHADOW_OFFSET,
            height: FAB_SIZE + SHADOW_OFFSET,
          }}
        >
          {/* Hard shadow layer */}
          <AnimatedView
            style={[
              shadowAnimStyle,
              {
                position: 'absolute',
                top: SHADOW_OFFSET,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: Colors.primaryShadow,
              },
            ]}
          />
          {/* FAB button */}
          <AnimatedPressable
            onPressIn={() => {
              translateX.value = withSpring(SHADOW_OFFSET, springs.snappy);
              translateY.value = withSpring(SHADOW_OFFSET, springs.snappy);
              shadowOpacity.value = withSpring(0, springs.snappy);
              haptic.medium();
            }}
            onPressOut={() => {
              translateX.value = withTiming(0, { duration: 120 });
              translateY.value = withTiming(0, { duration: 120 });
              shadowOpacity.value = withTiming(1, { duration: 120 });
            }}
            onPress={() => openSheet()}
            style={[
              fabAnimStyle,
              {
                width: FAB_SIZE,
                height: FAB_SIZE,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Text
              style={{
                color: '#000000',
                fontSize: 28,
                fontFamily: Fonts.bold,
                lineHeight: 32,
                marginTop: -2,
              }}
            >
              +
            </Text>
          </AnimatedPressable>
        </View>

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
