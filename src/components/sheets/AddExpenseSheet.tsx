import React, { useState, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { H3, Caption } from '@/components/ui/Typography';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { useCategories } from '@/hooks/useCategories';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
import { computeNudge, NudgeResult } from '@/utils/nudgeEngine';
import { getCurrentMonth } from '@/utils/dates';
import type { Transaction } from '@/db/types';

export interface AddExpenseSheetRef {
  present: (prefilledCategoryId?: string) => void;
  presentEdit: (transaction: Transaction) => void;
  dismiss: () => void;
}

interface AddExpenseSheetProps {
  onExpenseSaved?: (nudge: NudgeResult) => void;
}

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI'];

export const AddExpenseSheet = forwardRef<AddExpenseSheetRef, AddExpenseSheetProps>(
  ({ onExpenseSaved }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const categories = useCategories();
    const addTransaction = useLumaStore(s => s.addTransaction);
    const updateTransaction = useLumaStore(s => s.updateTransaction);
    const deleteTransaction = useLumaStore(s => s.deleteTransaction);
    const getSetting = useLumaStore(s => s.getSetting);
    const setSetting = useLumaStore(s => s.setSetting);
    const allTransactions = useLumaStore(s => s.transactions);
    const allBudgets = useLumaStore(s => s.budgets);

    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('food');
    const [merchant, setMerchant] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    useImperativeHandle(ref, () => ({
      present: (prefilledCategoryId?: string) => {
        setEditingTransaction(null);
        if (prefilledCategoryId) {
          setSelectedCategoryId(prefilledCategoryId);
        } else {
          const lastCat = getSetting('last_category_id');
          if (lastCat) setSelectedCategoryId(lastCat);
        }
        const lastPm = getSetting('last_payment_method');
        if (lastPm) setPaymentMethod(lastPm);
        setAmount('');
        setMerchant('');
        setNotes('');
        sheetRef.current?.present();
      },
      presentEdit: (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setAmount(String(transaction.amount));
        setSelectedCategoryId(transaction.categoryId);
        setMerchant(transaction.merchant);
        setPaymentMethod(transaction.paymentMethod);
        setNotes(transaction.notes);
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const handleSave = useCallback(async () => {
      if (!amount || parseFloat(amount) <= 0 || saving) return;
      setSaving(true);
      haptic.medium();

      const parsedAmount = parseFloat(amount);
      const { month, year } = getCurrentMonth();

      try {
        if (editingTransaction) {
          await updateTransaction(editingTransaction.id, {
            amount: parsedAmount,
            categoryId: selectedCategoryId,
            merchant: merchant.trim(),
            paymentMethod,
            notes: notes.trim(),
          });
          sheetRef.current?.dismiss();
          // No nudge on edit — just dismiss
          onExpenseSaved?.({ text: '', type: 'neutral' });
        } else {
          const now = Date.now();
          await addTransaction({
            amount: parsedAmount,
            categoryId: selectedCategoryId,
            merchant: merchant.trim(),
            date: now,
            paymentMethod,
            notes: notes.trim(),
          });

          await setSetting('last_category_id', selectedCategoryId);
          await setSetting('last_payment_method', paymentMethod);

          const catTransactions = allTransactions.filter(t => {
            if (t.categoryId !== selectedCategoryId) return false;
            const d = new Date(t.date);
            return d.getMonth() + 1 === month && d.getFullYear() === year;
          });

          const categoryBudget = allBudgets.find(
            b => b.categoryId === selectedCategoryId && b.month === month && b.year === year
          )?.amount ?? null;

          const categorySpent = catTransactions.reduce((sum, t) => sum + t.amount, 0) + parsedAmount;

          const today = new Date();
          const todayCount = catTransactions.filter(t => {
            const d = new Date(t.date);
            return d.getDate() === today.getDate() &&
              d.getMonth() === today.getMonth() &&
              d.getFullYear() === today.getFullYear();
          }).length + 1;

          const selectedCategory = categories.find(c => c.id === selectedCategoryId);
          const nudge = computeNudge({
            transactionAmount: parsedAmount,
            categorySpentTotal: categorySpent,
            categoryBudget,
            categoryName: selectedCategory?.name ?? 'this',
            sameCategoryTodayCount: todayCount,
          });

          sheetRef.current?.dismiss();
          onExpenseSaved?.(nudge);
        }
      } catch (e) {
        console.error('Save error:', e);
      } finally {
        setSaving(false);
      }
    }, [amount, selectedCategoryId, merchant, paymentMethod, notes, saving, editingTransaction, categories, allTransactions, allBudgets]);

    const handleDelete = useCallback(async () => {
      if (!editingTransaction || deleting) return;
      setDeleting(true);
      haptic.warning();
      try {
        await deleteTransaction(editingTransaction.id);
        sheetRef.current?.dismiss();
      } catch (e) {
        console.error('Delete error:', e);
      } finally {
        setDeleting(false);
      }
    }, [editingTransaction, deleting]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['85%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: Colors.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        handleIndicatorStyle={{ backgroundColor: Colors.textMuted, width: 36 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={{ paddingHorizontal: Spacing.md, paddingTop: 8 }}>
            <H3 style={{ marginBottom: Spacing.lg }}>
              {editingTransaction ? 'Edit expense' : 'Log expense'}
            </H3>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: Spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
                paddingBottom: Spacing.md,
              }}
            >
              <Text style={{ fontFamily: Fonts.bold, fontSize: 48, color: Colors.textMuted, marginRight: 4 }}>₹</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                autoFocus
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 48,
                  color: Colors.textPrimary,
                  flex: 1,
                  fontVariant: ['tabular-nums'],
                }}
              />
            </View>

            <Caption style={{ marginBottom: 10 }}>Category</Caption>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: Spacing.lg, marginHorizontal: -Spacing.md }}
              contentContainerStyle={{ paddingHorizontal: Spacing.md }}
            >
              {categories.map(cat => (
                <CategoryChip
                  key={cat.id}
                  icon={cat.icon}
                  name={cat.name}
                  color={cat.color}
                  selected={selectedCategoryId === cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
                />
              ))}
            </ScrollView>

            <View
              style={{
                backgroundColor: Colors.surface2,
                borderRadius: Radius.sm,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: Spacing.md,
                paddingVertical: 12,
                marginBottom: Spacing.md,
              }}
            >
              <TextInput
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Where did you spend? (optional)"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                style={{ fontFamily: Fonts.regular, fontSize: 15, color: Colors.textPrimary }}
              />
            </View>

            <Caption style={{ marginBottom: 10 }}>Payment</Caption>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.lg }}>
              {PAYMENT_METHODS.map(pm => (
                <Pressable
                  key={pm}
                  onPress={() => { setPaymentMethod(pm); haptic.light(); }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: Radius.none,
                    borderWidth: 1.5,
                    borderColor: paymentMethod === pm ? Colors.primary : Colors.border,
                    backgroundColor: paymentMethod === pm ? `${Colors.primary}18` : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: paymentMethod === pm ? Fonts.semibold : Fonts.regular,
                      fontSize: 13,
                      color: paymentMethod === pm ? Colors.primary : Colors.textSecondary,
                    }}
                  >
                    {pm}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View
              style={{
                backgroundColor: Colors.surface2,
                borderRadius: Radius.sm,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: Spacing.md,
                paddingVertical: 12,
                marginBottom: Spacing.xl,
              }}
            >
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a note (optional)"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                style={{ fontFamily: Fonts.regular, fontSize: 15, color: Colors.textPrimary }}
              />
            </View>

            <Button
              onPress={handleSave}
              disabled={!amount || parseFloat(amount) <= 0}
              loading={saving}
              fullWidth
              size="lg"
            >
              {editingTransaction ? 'Update expense' : 'Save'}
            </Button>

            {editingTransaction && (
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
                  {deleting ? 'Deleting...' : 'Delete expense'}
                </Text>
              </Pressable>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);
