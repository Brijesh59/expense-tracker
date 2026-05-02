import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BodyMedium, Caption } from '@/components/ui/Typography';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { formatAmount } from '@/utils/currency';
import { stagger } from '@/constants/animations';
import type { BudgetWithSpend } from '@/hooks/useBudgets';
import type { Category } from '@/db/types';

interface CategoryBudgetCardProps {
  item: BudgetWithSpend;
  category: Category | undefined;
  index: number;
  onPress: () => void;
}

export function CategoryBudgetCard({ item, category, index, onPress }: CategoryBudgetCardProps) {
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(index * stagger, withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(index * stagger, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!category) return null;

  const isOver = item.ratio >= 1;
  const leftLabel = isOver
    ? `Over by ${formatAmount(Math.abs(item.remaining))}`
    : `${formatAmount(item.remaining)} left`;
  const cardSurface = isDark ? colors.surface : '#FBFDFE';
  const cardBorder = isDark ? colors.border : 'rgba(60,110,145,0.12)';
  const iconSurface = isDark ? `${category.color}25` : `${category.color}18`;

  return (
    <Animated.View style={animatedStyle}>
      <Card onPress={onPress} style={{ marginBottom: 10, backgroundColor: cardSurface, borderColor: cardBorder }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: iconSurface,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>{category.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <BodyMedium>{category.name}</BodyMedium>
            <Caption>{formatAmount(item.spent)} / {formatAmount(item.budget.amount)}</Caption>
          </View>
          <Caption
            color={isOver ? colors.red : colors.textMuted}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {leftLabel}
          </Caption>
        </View>
        <ProgressBar ratio={item.ratio} delay={index * stagger + 200} />
      </Card>
    </Animated.View>
  );
}
