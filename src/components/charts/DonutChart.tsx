import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { formatAmount } from '@/utils/currency';
import type { SpendByCategory } from '@/utils/analytics';
import type { Category } from '@/db/types';

interface DonutChartProps {
  data: SpendByCategory[];
  categories: Category[];
  totalSpent: number;
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number): string {
  const o1 = polarToCartesian(cx, cy, outerR, startDeg);
  const o2 = polarToCartesian(cx, cy, outerR, endDeg);
  const i1 = polarToCartesian(cx, cy, innerR, endDeg);
  const i2 = polarToCartesian(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export function DonutChart({ data, categories, totalSpent, size = 220 }: DonutChartProps) {
  const { colors, isDark } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const chartData = data
    .filter(d => d.total > 0)
    .map(d => {
      const cat = categories.find(c => c.id === d.categoryId);
      return {
        label: cat?.name ?? d.categoryId,
        value: d.total,
        color: cat?.color ?? colors.primary,
        categoryId: d.categoryId,
      };
    });

  if (chartData.length === 0) return null;

  const total = chartData.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.28;
  const gap = 2;

  let currentAngle = 0;
  const slices = chartData.map(d => {
    const sweep = (d.value / total) * (360 - gap * chartData.length);
    const start = currentAngle;
    const end = start + sweep;
    currentAngle = end + gap;
    return { ...d, start, end };
  });

  const selected = selectedId ? chartData.find(d => d.categoryId === selectedId) : null;

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          {slices.map(s => (
            <Path
              key={s.categoryId}
              d={slicePath(cx, cy, outerR, innerR, s.start, s.end)}
              fill={s.color}
              opacity={selectedId && selectedId !== s.categoryId ? 0.4 : 1}
              onPress={() => setSelectedId(prev => prev === s.categoryId ? null : s.categoryId)}
            />
          ))}
        </Svg>

        <View style={{ position: 'absolute', alignItems: 'center', pointerEvents: 'none' }}>
          {selected ? (
            <>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 18, color: colors.textPrimary }}>
                {formatAmount(selected.value)}
              </Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {selected.label}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: colors.textPrimary }}>
                {formatAmount(totalSpent)}
              </Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                total
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 16, marginTop: 12 }}>
        {chartData.map(d => (
          <Pressable
            key={d.categoryId}
            onPress={() => setSelectedId(prev => prev === d.categoryId ? null : d.categoryId)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: selectedId === d.categoryId
                ? `${d.color}${isDark ? '25' : '18'}`
                : isDark ? colors.surface2 : '#F2F6F9',
              borderWidth: 1,
              borderColor: selectedId === d.categoryId
                ? d.color
                : isDark ? colors.border : 'rgba(60,110,145,0.12)',
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: d.color }} />
            <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary }}>
              {d.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
