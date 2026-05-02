import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { getMonthLabel, getPrevMonth, getNextMonth } from '@/utils/dates';
import { useMonthStore } from '@/store/monthStore';
import { haptic } from '@/utils/haptics';

export function MonthSelector() {
  const { colors } = useTheme();
  const { month, year, setMonth } = useMonthStore();

  const label = getMonthLabel(month, year);

  const goBack = () => {
    haptic.light();
    const prev = getPrevMonth(month, year);
    setMonth(prev.month, prev.year);
  };

  const goForward = () => {
    haptic.light();
    const next = getNextMonth(month, year);
    const now = new Date();
    if (next.year < now.getFullYear() || (next.year === now.getFullYear() && next.month <= now.getMonth() + 1)) {
      setMonth(next.month, next.year);
    }
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return month === now.getMonth() + 1 && year === now.getFullYear();
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable onPress={goBack} style={{ padding: 8 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>‹</Text>
      </Pressable>
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 15, color: colors.textPrimary }}>
        {label}
      </Text>
      <Pressable onPress={goForward} style={{ padding: 8, opacity: isCurrentMonth() ? 0.3 : 1 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>›</Text>
      </Pressable>
    </View>
  );
}
