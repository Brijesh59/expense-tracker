import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { onboarding } from '@/constants/copy';
import { useLumaStore } from '@/db/store';
import { Storage } from '@/db/storage';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/utils/haptics';
import { getCurrentMonth } from '@/utils/dates';

export default function FirstBudgetScreen() {
  const categories = useCategories();
  const addBudget = useLumaStore(s => s.addBudget);
  const setSetting = useLumaStore(s => s.setSetting);
  const [selectedCategoryId, setSelectedCategoryId] = useState('food');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const topCategories = categories.slice(0, 6);

  const handleSkip = async () => {
    haptic.light();
    await Storage.markLaunched();
    router.replace('/(tabs)');
  };

  const handleSetBudget = async () => {
    if (!amount || parseFloat(amount) <= 0 || saving) return;
    setSaving(true);
    haptic.heavy();

    const { month, year } = getCurrentMonth();

    try {
      await addBudget({ categoryId: selectedCategoryId, amount: parseFloat(amount), month, year });
      await setSetting('last_category_id', selectedCategoryId);
      router.push({
        pathname: '/onboarding/first-expense',
        params: { categoryId: selectedCategoryId },
      });
    } catch (e) {
      console.error('Budget creation error:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <H1 style={{ marginBottom: Spacing.sm }}>{onboarding.firstBudget.headline}</H1>
        <Body color={Colors.textSecondary} style={{ marginBottom: Spacing.xl }}>
          {onboarding.firstBudget.subtext}
        </Body>

        <Caption style={{ marginBottom: 12 }}>Choose a category</Caption>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: Spacing.xl, marginHorizontal: -Spacing.lg }}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
        >
          {topCategories.map(cat => (
            <Pressable
              key={cat.id}
              onPress={() => { setSelectedCategoryId(cat.id); haptic.light(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: Radius.full,
                borderWidth: 1.5,
                borderColor: selectedCategoryId === cat.id ? cat.color : Colors.border,
                backgroundColor: selectedCategoryId === cat.id ? `${cat.color}20` : Colors.surface,
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
              <Text
                style={{
                  fontFamily: selectedCategoryId === cat.id ? Fonts.semibold : Fonts.regular,
                  fontSize: 14,
                  color: selectedCategoryId === cat.id ? cat.color : Colors.textSecondary,
                }}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Caption style={{ marginBottom: 12 }}>Monthly budget amount</Caption>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderRadius: Radius.lg,
            paddingHorizontal: Spacing.md,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            marginBottom: Spacing.sm,
          }}
        >
          <Text style={{ fontFamily: Fonts.bold, fontSize: 32, color: Colors.textMuted, marginRight: 4 }}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder={onboarding.firstBudget.placeholder}
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            autoFocus
            style={{
              fontFamily: Fonts.bold,
              fontSize: 32,
              color: Colors.textPrimary,
              flex: 1,
              fontVariant: ['tabular-nums'],
            }}
          />
        </View>

        <Caption style={{ marginBottom: Spacing.xl }}>{onboarding.firstBudget.reassurance}</Caption>

        <Button
          onPress={handleSetBudget}
          disabled={!amount || parseFloat(amount) <= 0}
          loading={saving}
          fullWidth
          size="lg"
        >
          {onboarding.firstBudget.cta}
        </Button>

        <Pressable onPress={handleSkip} style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: Colors.textMuted }}>
            Skip for now
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
