import React from 'react';
import { View } from 'react-native';
import { H3, Body } from './Typography';
import { Button } from './Button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { LunaMascot } from '@/components/mascot/LunaMascot';

interface EmptyStateProps {
  headline: string;
  subtext: string;
  ctaLabel?: string;
  onCTA?: () => void;
}

export function EmptyState({ headline, subtext, ctaLabel, onCTA }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
        gap: Spacing.sm,
      }}
    >
      <View style={{ marginBottom: Spacing.md }}>
        <LunaMascot size={116} />
      </View>
      <H3 style={{ textAlign: 'center' }}>{headline}</H3>
      <Body color={colors.textSecondary} style={{ textAlign: 'center' }}>
        {subtext}
      </Body>
      {ctaLabel && onCTA && (
        <Button onPress={onCTA} style={{ marginTop: Spacing.md, alignSelf: 'center' }}>
          {ctaLabel}
        </Button>
      )}
    </View>
  );
}
