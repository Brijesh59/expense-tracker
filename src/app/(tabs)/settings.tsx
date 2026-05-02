import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { H2, H3, BodyMedium, Caption } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/hooks/useSettings';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
import { CURRENCIES, type CurrencyCode } from '@/utils/currency';

export default function SettingsScreen() {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md }}>
        <Text style={{ fontSize: 34, fontFamily: Fonts.bold, color: Colors.textPrimary }}>Settings</Text>
      </View>

      <View style={{ paddingHorizontal: Spacing.md, gap: Spacing.sm }}>
        <Card>
          <Pressable
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <BodyMedium>Currency</BodyMedium>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Caption color={Colors.primary}>{currency}</Caption>
              <Caption>{showCurrencyPicker ? '▲' : '▼'}</Caption>
            </View>
          </Pressable>

          {showCurrencyPicker && (
            <View
              style={{
                marginTop: Spacing.md,
                borderTopWidth: 1,
                borderTopColor: Colors.border,
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
                  <BodyMedium color={c === currency ? Colors.primary : Colors.textPrimary}>{c}</BodyMedium>
                  {c === currency && <Caption color={Colors.primary}>✓</Caption>}
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        <Card>
          <Pressable
            onPress={() => router.push('/settings/categories')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <BodyMedium>Categories</BodyMedium>
            <Caption>›</Caption>
          </Pressable>
        </Card>

        <Card>
          <Pressable onPress={handleReset}>
            <BodyMedium color={Colors.red}>Reset all data</BodyMedium>
            <Caption style={{ marginTop: 4 }}>Deletes transactions and budgets</Caption>
          </Pressable>
        </Card>

        <Card>
          <BodyMedium>About Luma</BodyMedium>
          <Caption style={{ marginTop: 4 }}>Version 1.0.0</Caption>
          <Caption style={{ marginTop: 2 }}>Clarity over complexity.</Caption>
        </Card>
      </View>
    </SafeAreaView>
  );
}
