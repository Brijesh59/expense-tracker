import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { onboarding } from '@/constants/copy';
import { useLumaStore } from '@/db/store';
import { Storage } from '@/db/storage';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/utils/haptics';
import { getCurrentMonth } from '@/utils/dates';
import { computeNudge } from '@/utils/nudgeEngine';

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI'];

export default function FirstExpenseScreen() {
  const { colors } = useTheme();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const categories = useCategories();
  const addTransaction = useLumaStore(s => s.addTransaction);
  const getEffectiveBudget = useLumaStore(s => s.getEffectiveBudget);
  const transactions = useLumaStore(s => s.transactions);

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [saving, setSaving] = useState(false);

  const selectedCategory = categories.find(c => c.id === (categoryId || 'food'));

  const handleSkip = async () => {
    haptic.light();
    await Storage.markLaunched();
    router.replace('/(tabs)');
  };

  const handleSave = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0 || saving) return;
    setSaving(true);
    haptic.medium();

    const parsedAmount = parseFloat(amount);
    const { month, year } = getCurrentMonth();
    const catId = categoryId || 'food';

    try {
      await addTransaction({
        amount: parsedAmount,
        categoryId: catId,
        merchant: merchant.trim(),
        date: Date.now(),
        paymentMethod,
        notes: '',
      });

      const categoryBudget = getEffectiveBudget(catId, month, year)?.amount ?? null;

      const categorySpent = transactions
        .filter(t => t.categoryId === catId)
        .reduce((sum, t) => sum + t.amount, 0) + parsedAmount;

      const nudge = computeNudge({
        transactionAmount: parsedAmount,
        categorySpentTotal: categorySpent,
        categoryBudget,
        categoryName: selectedCategory?.name ?? 'this',
        sameCategoryTodayCount: 1,
      });

      router.push({
        pathname: '/onboarding/insight-reveal',
        params: { nudgeText: nudge.text, nudgeType: nudge.type },
      });
    } catch (e) {
      console.error('Expense save error:', e);
    } finally {
      setSaving(false);
    }
  }, [amount, merchant, paymentMethod, saving, categoryId, selectedCategory, getEffectiveBudget, transactions]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <H1 style={{ marginBottom: Spacing.sm }}>{onboarding.firstExpense.headline}</H1>
        <Body color={colors.textSecondary} style={{ marginBottom: Spacing.xl }}>
          {onboarding.firstExpense.subtext}
        </Body>

        {selectedCategory && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: `${selectedCategory.color}15`,
              borderRadius: Radius.full,
              paddingHorizontal: 14,
              paddingVertical: 8,
              alignSelf: 'flex-start',
              marginBottom: Spacing.lg,
            }}
          >
            <Text style={{ fontSize: 18 }}>{selectedCategory.icon}</Text>
            <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: selectedCategory.color }}>
              {selectedCategory.name}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: Radius.lg,
            paddingHorizontal: Spacing.md,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: Spacing.md,
          }}
        >
          <Text style={{ fontFamily: Fonts.bold, fontSize: 36, color: colors.textMuted, marginRight: 4 }}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder={onboarding.firstExpense.placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            autoFocus
            style={{
              fontFamily: Fonts.bold,
              fontSize: 36,
              color: colors.textPrimary,
              flex: 1,
              fontVariant: ['tabular-nums'],
            }}
          />
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.md,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: Spacing.md,
          }}
        >
          <TextInput
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Where did you spend? (optional)"
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.textPrimary }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.xl }}>
          {PAYMENT_METHODS.map(pm => (
            <Pressable
              key={pm}
              onPress={() => { setPaymentMethod(pm); haptic.light(); }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: Radius.full,
                borderWidth: 1.5,
                borderColor: paymentMethod === pm ? colors.primary : colors.border,
                backgroundColor: paymentMethod === pm ? `${colors.primary}20` : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: paymentMethod === pm ? Fonts.semibold : Fonts.regular,
                  fontSize: 13,
                  color: paymentMethod === pm ? colors.primary : colors.textSecondary,
                }}
              >
                {pm}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          onPress={handleSave}
          disabled={!amount || parseFloat(amount) <= 0}
          loading={saving}
          fullWidth
          size="lg"
        >
          Save
        </Button>

        <Pressable onPress={handleSkip} style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: colors.textMuted }}>
            Skip for now
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
