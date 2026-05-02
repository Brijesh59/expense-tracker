import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { H2, H3, BodyMedium, Caption } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/hooks/useSettings';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
import { CURRENCIES, type CurrencyCode } from '@/utils/currency';

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string }[] = [
  { label: 'System', value: 'system', icon: '⚙️' },
  { label: 'Light', value: 'light', icon: '☀️' },
  { label: 'Dark', value: 'dark', icon: '🌙' },
];

export default function SettingsScreen() {
  const { colors, mode: themeMode, isDark, setMode: setThemeMode } = useTheme();
  const { getSetting, setSetting } = useSettings();
  const resetData = useLumaStore(s => s.resetData);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    const val = getSetting('currency');
    if (val) setCurrency(val as CurrencyCode);
  }, []);

  const handleCurrencyChange = useCallback(async (c: CurrencyCode) => {
    setCurrency(c);
    await setSetting('currency', c);
    setShowCurrencyPicker(false);
    haptic.success();
  }, []);

  const handleThemeChange = (mode: ThemeMode) => {
    haptic.light();
    setThemeMode(mode);
  };

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset data',
      'This will delete all transactions and budgets. Categories will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            haptic.warning();
            await resetData();
          },
        },
      ]
    );
  }, [resetData]);

  const settingCardStyle = {
    backgroundColor: isDark ? colors.surface : '#FBFDFE',
    borderColor: isDark ? colors.border : 'rgba(60,110,145,0.12)',
  };

  const optionSurface = isDark ? colors.surface2 : '#F2F6F9';
  const selectedOptionSurface = isDark ? `${colors.primary}18` : '#FFF8D7';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md }}>
        <Text style={{ fontSize: 34, fontFamily: Fonts.bold, color: colors.textPrimary }}>Settings</Text>
      </View>

      <View style={{ paddingHorizontal: Spacing.md, gap: Spacing.sm }}>
        {/* Currency */}
        <Card style={settingCardStyle}>
          <Pressable
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <BodyMedium>Currency</BodyMedium>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Caption color={colors.primary}>{currency}</Caption>
              <Caption>{showCurrencyPicker ? '▲' : '▼'}</Caption>
            </View>
          </Pressable>

          {showCurrencyPicker && (
            <View
              style={{
                marginTop: Spacing.md,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: Spacing.md,
                gap: 8,
              }}
            >
              {CURRENCIES.map(c => (
                <Pressable
                  key={c}
                  onPress={() => handleCurrencyChange(c)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}
                >
                  <BodyMedium color={c === currency ? colors.primary : colors.textPrimary}>{c}</BodyMedium>
                  {c === currency && <Caption color={colors.primary}>✓</Caption>}
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        {/* Categories */}
        <Card style={settingCardStyle}>
          <Pressable
            onPress={() => router.push('/settings/categories')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <BodyMedium>Categories</BodyMedium>
            <Caption>›</Caption>
          </Pressable>
        </Card>

        {/* Theme */}
        <Card style={settingCardStyle}>
          <BodyMedium style={{ marginBottom: Spacing.sm }}>Theme</BodyMedium>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {THEME_OPTIONS.map(opt => {
              const isSelected = themeMode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleThemeChange(opt.value)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: Radius.md,
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? selectedOptionSurface : optionSurface,
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{opt.icon}</Text>
                  <Text
                    style={{
                      fontFamily: isSelected ? Fonts.semibold : Fonts.regular,
                      fontSize: 12,
                      color: isSelected ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Reset */}
        <Card style={settingCardStyle}>
          <Pressable onPress={handleReset}>
            <BodyMedium color={colors.red}>Reset all data</BodyMedium>
            <Caption style={{ marginTop: 4 }}>Deletes transactions and budgets</Caption>
          </Pressable>
        </Card>

        {/* About */}
        <Card style={settingCardStyle}>
          <BodyMedium>About Luma</BodyMedium>
          <Caption style={{ marginTop: 4 }}>Version 1.0.0</Caption>
          <Caption style={{ marginTop: 2 }}>Clarity over complexity.</Caption>
        </Card>
      </View>
    </SafeAreaView>
  );
}
