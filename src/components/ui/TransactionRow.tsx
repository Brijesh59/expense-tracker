import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { BodyMedium, Caption } from '@/components/ui/Typography';
import { useCurrency } from '@/hooks/useCurrency';
import { stagger } from '@/constants/animations';
import type { Transaction } from '@/db/types';
import type { Category } from '@/db/types';

interface TransactionRowProps {
  transaction: Transaction;
  category: Category | undefined;
  index: number;
  onPress?: () => void;
}

export function TransactionRow({ transaction, category, index, onPress }: TransactionRowProps) {
  const { colors } = useTheme();
  const { format } = useCurrency();
  const translateX = useSharedValue(-20);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withDelay(index * stagger, withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(index * stagger, withTiming(1, { duration: 250 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: `${colors.border}60`,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: category ? `${category.color}25` : colors.surface2,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>{category?.icon ?? '📦'}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <BodyMedium numberOfLines={1}>
            {transaction.merchant || category?.name || 'Expense'}
          </BodyMedium>
          {transaction.notes ? (
            <Caption numberOfLines={1}>{transaction.notes}</Caption>
          ) : null}
        </View>

        <Text
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 15,
            color: colors.textPrimary,
            fontVariant: ['tabular-nums'],
          }}
        >
          {format(transaction.amount)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
