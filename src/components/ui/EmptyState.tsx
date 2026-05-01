import React from 'react';
import { View } from 'react-native';
import { H3, Body } from './Typography';
import { Button } from './Button';
import { Colors, Spacing } from '@/constants/theme';

interface EmptyStateProps {
  headline: string;
  subtext: string;
  ctaLabel?: string;
  onCTA?: () => void;
  icon?: string;
}

export function EmptyState({ headline, subtext, ctaLabel, onCTA, icon = '🐱' }: EmptyStateProps) {
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
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: Colors.surface2,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing.sm,
        }}
      >
        <Body style={{ fontSize: 36 }}>{icon}</Body>
      </View>
      <H3 style={{ textAlign: 'center' }}>{headline}</H3>
      <Body color={Colors.textSecondary} style={{ textAlign: 'center' }}>
        {subtext}
      </Body>
      {ctaLabel && onCTA && (
        <Button onPress={onCTA} style={{ marginTop: Spacing.md }}>
          {ctaLabel}
        </Button>
      )}
    </View>
  );
}
