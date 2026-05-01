import React, { useState, forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { View, TextInput, ScrollView, Text, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { H3, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
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

    useImperativeHandle(ref, () => ({
      present: (existingBudget?: Budget, categoryId?: string) => {
        if (existingBudget) {
          setEditingBudget(existingBudget);
          setSelectedCategoryId(existingBudget.categoryId);
          setAmount(String(existingBudget.amount));
        } else {
          setEditingBudget(null);
          setAmount('');
          const firstAvailable = categories.find(c => !existingCategoryIds.includes(c.id));
          setSelectedCategoryId(categoryId ?? firstAvailable?.id ?? 'food');
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
          await updateBudget(editingBudget.id, { amount: parseFloat(amount) });
        } else {
          await addBudget({ categoryId: selectedCategoryId, amount: parseFloat(amount), month, year });
        }
        sheetRef.current?.dismiss();
        onSaved?.();
      } catch (e) {
        console.error('Budget save error:', e);
      } finally {
        setSaving(false);
      }
    }, [amount, selectedCategoryId, saving, editingBudget, month, year]);

    const handleDelete = useCallback(async () => {
      if (!editingBudget || deleting) return;
      setDeleting(true);
      haptic.warning();
      try {
        await deleteBudget(editingBudget.id);
        sheetRef.current?.dismiss();
        onSaved?.();
      } catch (e) {
        console.error('Budget delete error:', e);
      } finally {
        setDeleting(false);
      }
    }, [editingBudget, deleting]);

    const availableCategories = editingBudget
      ? categories
      : categories.filter(c => !existingCategoryIds.includes(c.id));

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['60%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: Colors.surface }}
        handleIndicatorStyle={{ backgroundColor: Colors.border, width: 40 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
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
                  borderRadius: Radius.full,
                  borderWidth: 1.5,
                  borderColor: selectedCategoryId === cat.id ? cat.color : Colors.border,
                  backgroundColor: selectedCategoryId === cat.id ? `${cat.color}20` : Colors.surface,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
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

          <Caption style={{ marginBottom: 10 }}>Monthly budget</Caption>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.surface2,
              borderRadius: Radius.md,
              paddingHorizontal: Spacing.md,
              paddingVertical: 12,
              marginBottom: Spacing.xl,
            }}
          >
            <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: Colors.textMuted, marginRight: 4 }}>₹</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={Colors.border}
              keyboardType="decimal-pad"
              autoFocus
              style={{
                fontFamily: Fonts.bold,
                fontSize: 24,
                color: Colors.textPrimary,
                flex: 1,
                fontVariant: ['tabular-nums'],
              }}
            />
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
                color: deleting ? Colors.textMuted : Colors.red,
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
