import React, { useState, forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { H3, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
import { useCurrency } from '@/hooks/useCurrency';
import type { Budget } from '@/db/types';

export interface BudgetFormSheetRef {
  present: (existingBudget?: Budget, categoryId?: string) => void;
  dismiss: () => void;
}

interface BudgetFormSheetProps {
  month: number;
  year: number;
  existingCategoryIds?: string[];
  onSaved?: () => void;
}

export const BudgetFormSheet = forwardRef<BudgetFormSheetRef, BudgetFormSheetProps>(
  ({ month, year, existingCategoryIds = [], onSaved }, ref) => {
    const { colors } = useTheme();
    const { symbol } = useCurrency();
    const sheetRef = useRef<BottomSheetModal>(null);
    const categories = useCategories();
    const addBudget = useLumaStore(s => s.addBudget);
    const updateBudget = useLumaStore(s => s.updateBudget);
    const deleteBudget = useLumaStore(s => s.deleteBudget);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('food');
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [scope, setScope] = useState<'everyMonth' | 'thisMonth'>('everyMonth');

    useImperativeHandle(ref, () => ({
      present: (existingBudget?: Budget, categoryId?: string) => {
        if (existingBudget) {
          setEditingBudget(existingBudget);
          setSelectedCategoryId(existingBudget.categoryId);
          setAmount(String(existingBudget.amount));
          setScope('everyMonth');
        } else {
          setEditingBudget(null);
          setAmount('');
          setScope('everyMonth');
          const firstAvailable = categories.find(c => !existingCategoryIds.includes(c.id));
          setSelectedCategoryId(categoryId ?? firstAvailable?.id ?? categories[0]?.id ?? 'others');
        }
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const handleSave = useCallback(async () => {
      if (!amount || parseFloat(amount) <= 0 || saving) return;
      setSaving(true);
      haptic.heavy();

      try {
        if (editingBudget) {
          await updateBudget(
            editingBudget.id,
            { amount: parseFloat(amount) },
            { scope, month: editingBudget.month, year: editingBudget.year, categoryId: editingBudget.categoryId }
          );
        } else {
          await addBudget({ categoryId: selectedCategoryId, amount: parseFloat(amount), month, year }, { scope });
        }
        sheetRef.current?.dismiss();
        onSaved?.();
      } catch (e) {
        console.error('Budget save error:', e);
      } finally {
        setSaving(false);
      }
    }, [amount, selectedCategoryId, saving, editingBudget, month, year, scope, updateBudget, addBudget, onSaved]);

    const handleDelete = useCallback(async () => {
      if (!editingBudget || deleting) return;
      setDeleting(true);
      haptic.warning();
      try {
        await deleteBudget(
          editingBudget.id,
          { scope, month: editingBudget.month, year: editingBudget.year, categoryId: editingBudget.categoryId }
        );
        sheetRef.current?.dismiss();
        onSaved?.();
      } catch (e) {
        console.error('Budget delete error:', e);
      } finally {
        setDeleting(false);
      }
    }, [editingBudget, deleting, scope, deleteBudget, onSaved]);

    const availableCategories = editingBudget
      ? categories
      : categories.filter(c => !existingCategoryIds.includes(c.id));

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['58%']}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 40, paddingTop: 8 }}
        >
          <H3 style={{ marginBottom: Spacing.lg }}>
            {editingBudget ? 'Edit budget' : 'Set budget'}
          </H3>

          <Caption style={{ marginBottom: 10 }}>Category</Caption>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: Spacing.lg, marginHorizontal: -Spacing.md }}
            contentContainerStyle={{ paddingHorizontal: Spacing.md }}
          >
            {availableCategories.map(cat => (
              <Pressable
                key={cat.id}
                onPress={() => { setSelectedCategoryId(cat.id); haptic.light(); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: Radius.none,
                  borderWidth: 1.5,
                  borderColor: selectedCategoryId === cat.id ? cat.color : colors.border,
                  backgroundColor: selectedCategoryId === cat.id ? `${cat.color}18` : colors.surface,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                <Text
                  style={{
                    fontFamily: selectedCategoryId === cat.id ? Fonts.semibold : Fonts.regular,
                    fontSize: 14,
                    color: selectedCategoryId === cat.id ? cat.color : colors.textSecondary,
                  }}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Caption style={{ marginBottom: 10 }}>Monthly budget</Caption>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.input,
              borderRadius: Radius.sm,
              borderWidth: 1,
              borderColor: colors.inputBorder,
              paddingHorizontal: Spacing.md,
              paddingVertical: 12,
              marginBottom: Spacing.xl,
            }}
          >
            <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: colors.textMuted, marginRight: 4 }}>{symbol}</Text>
            <BottomSheetTextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              style={{
                fontFamily: Fonts.bold,
                fontSize: 24,
                color: colors.textPrimary,
                flex: 1,
                fontVariant: ['tabular-nums'],
              }}
            />
          </View>

          <Caption style={{ marginBottom: 10 }}>
            {editingBudget ? 'Update' : 'Use this budget'}
          </Caption>
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginBottom: Spacing.xl,
            }}
          >
            {[
              { key: 'everyMonth', label: editingBudget ? 'Every month' : 'Every month' },
              { key: 'thisMonth', label: 'This month only' },
            ].map(option => {
              const selected = scope === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => { setScope(option.key as 'everyMonth' | 'thisMonth'); haptic.light(); }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 11,
                    borderRadius: Radius.sm,
                    borderWidth: 1.5,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? `${colors.primary}18` : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: selected ? Fonts.semibold : Fonts.regular,
                      fontSize: 13,
                      color: selected ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            onPress={handleSave}
            disabled={!amount || parseFloat(amount) <= 0}
            loading={saving}
            fullWidth
            size="lg"
          >
            {editingBudget ? 'Update budget' : 'Set budget'}
          </Button>

          {editingBudget && (
            <Pressable
              onPress={handleDelete}
              disabled={deleting}
              style={{ alignItems: 'center', paddingVertical: Spacing.md }}
            >
              <Text style={{
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: deleting ? colors.textMuted : colors.red,
              }}>
                {deleting ? 'Deleting...' : 'Delete budget'}
              </Text>
            </Pressable>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);
