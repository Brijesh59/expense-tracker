import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { springs } from '@/constants/animations';
import type { BudgetWithSpend } from '@/hooks/useBudgets';
import type { Category } from '@/db/types';

const CHART_MAX_HEIGHT = 200;
const OVERFLOW_BUFFER = 48;
const BAR_WIDTH = 64;
const COLUMN_GAP = 14;
const MIN_BAR_HEIGHT = 64; // ensures icon always fits

interface BudgetBarChartProps {
  budgets: BudgetWithSpend[];
  categories: Category[];
  onBarPress: (budgetId: string) => void;
}

interface BarColumnProps {
  item: BudgetWithSpend;
  category: Category;
  maxBudget: number;
  index: number;
  onPress: () => void;
}

function BarColumn({ item, category, maxBudget, index, onPress }: BarColumnProps) {
  const rawBudgetBoxHeight = (item.budget.amount / maxBudget) * CHART_MAX_HEIGHT;
  // Scale up bars that would be too small, preserving the spent/budget ratio inside
  const scale = rawBudgetBoxHeight < MIN_BAR_HEIGHT ? MIN_BAR_HEIGHT / rawBudgetBoxHeight : 1;
  const budgetBoxHeight = rawBudgetBoxHeight * scale;
  const rawFillHeight = (item.spent / maxBudget) * CHART_MAX_HEIGHT;
  const targetFillHeight = Math.min(rawFillHeight * scale, budgetBoxHeight * 1.5, CHART_MAX_HEIGHT + OVERFLOW_BUFFER - 8);

  const fillHeight = useSharedValue(0);

  useEffect(() => {
    fillHeight.value = withDelay(index * 80, withSpring(targetFillHeight, springs.smooth));
  }, [targetFillHeight]);

  const fillStyle = useAnimatedStyle(() => ({
    height: fillHeight.value,
  }));

  const percentage = Math.round(item.ratio * 100);
  const isOver = item.ratio >= 1;

  const barColor = category.color;
  const fillBg = barColor + '50'; // 31% opacity fill

  return (
    <Pressable
      onPress={onPress}
      style={{ alignItems: 'center', marginHorizontal: COLUMN_GAP / 2 }}
    >
      {/* Chart area — bars grow from bottom upward */}
      <View
        style={{
          height: CHART_MAX_HEIGHT + OVERFLOW_BUFFER,
          width: BAR_WIDTH,
          justifyContent: 'flex-end',
        }}
      >
        {/* Dashed SVG budget cap box */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: BAR_WIDTH, height: budgetBoxHeight }}>
          <Svg width={BAR_WIDTH} height={budgetBoxHeight}>
            <Rect
              x={1.5}
              y={1.5}
              width={BAR_WIDTH - 3}
              height={budgetBoxHeight - 3}
              rx={0}
              ry={0}
              fill="transparent"
              stroke={barColor}
              strokeWidth={1.5}
              strokeDasharray="6,4"
              strokeOpacity={0.35}
            />
          </Svg>
        </View>

        {/* Animated fill bar */}
        <Animated.View
          style={[
            fillStyle,
            {
              position: 'absolute',
              bottom: 0,
              left: 4,
              right: 4,
              backgroundColor: fillBg,
              borderRadius: 0,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: 8,
            },
          ]}
        >
          <Text style={{ fontSize: 18 }}>{category.icon}</Text>
        </Animated.View>
      </View>

      {/* Labels below chart */}
      <View style={{ marginTop: 8, alignItems: 'center', gap: 1 }}>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: Colors.textPrimary }}>
          {Math.round(item.spent).toLocaleString('en-IN')}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.medium,
            fontSize: 12,
            color: isOver ? Colors.red : Colors.textSecondary,
          }}
        >
          {percentage}%
        </Text>
      </View>
    </Pressable>
  );
}

export function BudgetBarChart({ budgets, categories, onBarPress }: BudgetBarChartProps) {
  const active = budgets.filter(b => b.spent > 0);
  if (active.length === 0) return null;

  const sorted = [...active].sort((a, b) => b.budget.amount - a.budget.amount);
  const maxBudget = sorted[0].budget.amount;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
        paddingBottom: 4,
        alignItems: 'flex-end',
      }}
    >
      {sorted.map((item, index) => {
        const category = categories.find(c => c.id === item.categoryId);
        if (!category) return null;
        return (
          <BarColumn
            key={item.budget.id}
            item={item}
            category={category}
            maxBudget={maxBudget}
            index={index}
            onPress={() => onBarPress(item.budget.id)}
          />
        );
      })}
    </ScrollView>
  );
}
