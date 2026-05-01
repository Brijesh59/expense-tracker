import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts } from '@/constants/theme';
import type { DailySpend } from '@/utils/analytics';
import { getDayOfWeekLabel } from '@/utils/dates';

interface DailyBarChartProps {
  data: DailySpend[];
  width?: number;
}

const HEIGHT = 160;
const BAR_WIDTH = 28;
const PADDING = { top: 12, bottom: 36, left: 36, right: 12 };

export function DailyBarChart({ data, width = 320 }: DailyBarChartProps) {
  if (!data || data.length === 0) return null;

  const chartW = width - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const step = chartW / data.length;

  return (
    <View>
      <Svg width={width} height={HEIGHT}>
        {/* Gridlines */}
        {[0.25, 0.5, 0.75, 1].map(frac => {
          const y = PADDING.top + chartH * (1 - frac);
          return (
            <Line
              key={frac}
              x1={PADDING.left}
              x2={PADDING.left + chartW}
              y1={y}
              y2={y}
              stroke={Colors.border}
              strokeDasharray="4 4"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {data.map((d, i) => {
          const barH = Math.max((d.total / maxVal) * chartH, d.total > 0 ? 4 : 0);
          const x = PADDING.left + i * step + (step - BAR_WIDTH) / 2;
          const y = PADDING.top + chartH - barH;
          const isMax = d.total === maxVal && d.total > 0;
          const label = getDayOfWeekLabel(d.date);
          const labelX = PADDING.left + i * step + step / 2;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={barH}
                rx={5}
                ry={5}
                fill={isMax ? Colors.red : Colors.primary}
                opacity={0.85}
              />
              <SvgText
                x={labelX}
                y={HEIGHT - 6}
                fontSize={11}
                fill={Colors.textMuted}
                textAnchor="middle"
                fontFamily={Fonts.regular}
              >
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
