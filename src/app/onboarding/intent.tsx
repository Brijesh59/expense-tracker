import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { H1, Body } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { onboarding } from '@/constants/copy';
import { useSettings } from '@/hooks/useSettings';
import { haptic } from '@/utils/haptics';

export default function IntentScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const { setSetting } = useSettings();

  const handleContinue = async () => {
    if (selected) {
      await setSetting('user_intent', selected);
    }
    router.push('/onboarding/first-budget');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xl,
        }}
      >
        <H1 style={{ marginBottom: Spacing.sm }}>{onboarding.intent.headline}</H1>
        <Body color={colors.textSecondary} style={{ marginBottom: Spacing.xl }}>
          No pressure — just helps us understand what matters to you.
        </Body>

        <View style={{ gap: 12 }}>
          {onboarding.intent.options.map(option => {
            const isSelected = selected === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setSelected(isSelected ? null : option);
                  haptic.light();
                }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: Spacing.md,
                  borderRadius: Radius.lg,
                  borderWidth: 1.5,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? `${colors.primary}15` : colors.surface,
                }}
              >
                <Text
                  style={{
                    fontFamily: isSelected ? Fonts.semibold : Fonts.regular,
                    fontSize: 16,
                    color: isSelected ? colors.primary : colors.textPrimary,
                  }}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: 12 }}>
        <Button onPress={handleContinue} fullWidth size="lg">
          {onboarding.intent.cta}
        </Button>
        <Pressable onPress={handleContinue} style={{ alignItems: 'center', padding: 10 }}>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: colors.textMuted }}>
            Skip
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
