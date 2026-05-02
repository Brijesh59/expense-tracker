import React, { useState, useCallback, forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { H3, Caption } from '@/components/ui/Typography';
import { useCategories } from '@/hooks/useCategories';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
import { computeNudge, NudgeResult } from '@/utils/nudgeEngine';
import { getCurrentMonth } from '@/utils/dates';
import { processVoiceInput, VoiceResult, LogItem, BudgetItem } from '@/utils/parseVoiceExpense';

export interface VoiceExpenseSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface VoiceExpenseSheetProps {
  onExpenseSaved?: (nudge: NudgeResult) => void;
  onEditFirst?: (prefill: { amount: string; categoryId: string; merchant: string; paymentMethod: string | null; notes: string }) => void;
}

type VoiceState = 'idle' | 'listening' | 'parsing' | 'log_result' | 'budget_result' | 'query_result' | 'error' | 'unavailable';

export const VoiceExpenseSheet = forwardRef<VoiceExpenseSheetRef, VoiceExpenseSheetProps>(
  ({ onExpenseSaved, onEditFirst }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const categories = useCategories();
    const addTransaction = useLumaStore(s => s.addTransaction);
    const setSetting = useLumaStore(s => s.setSetting);
    const addBudget = useLumaStore(s => s.addBudget);
    const updateBudget = useLumaStore(s => s.updateBudget);
    const allTransactions = useLumaStore(s => s.transactions);
    const allBudgets = useLumaStore(s => s.budgets);

    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState('');
    const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
    const [pendingItems, setPendingItems] = useState<LogItem[]>([]);
    const [pendingBudgets, setPendingBudgets] = useState<BudgetItem[]>([]);
    const [saving, setSaving] = useState(false);

    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0);
    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    }));

    useEffect(() => {
      if (voiceState === 'listening') {
        pulseScale.value = withRepeat(withTiming(1.6, { duration: 1000, easing: Easing.out(Easing.ease) }), -1, true);
        pulseOpacity.value = withRepeat(withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }), -1, true);
      } else {
        cancelAnimation(pulseScale);
        cancelAnimation(pulseOpacity);
        pulseScale.value = withTiming(1, { duration: 200 });
        pulseOpacity.value = withTiming(0, { duration: 200 });
      }
    }, [voiceState]);

    useSpeechRecognitionEvent('result', (event) => {
      const text = event.results[0]?.transcript ?? '';
      setTranscript(text);
      if (event.isFinal && text) {
        setVoiceState('parsing');
        processVoiceInput(text, categories, allTransactions)
          .then(result => {
            setVoiceResult(result);
            if (result.intent === 'log') {
              setPendingItems(result.items);
              setVoiceState('log_result');
            } else if (result.intent === 'budget') {
              setPendingBudgets(result.items);
              setVoiceState('budget_result');
            } else {
              setVoiceState('query_result');
            }
            haptic.light();
          })
          .catch(err => {
            console.error('[VoiceAssistant] failed:', err);
            setVoiceState('error');
          });
      }
    });

    useSpeechRecognitionEvent('end', () => {
      setVoiceState(prev => (prev === 'listening' ? 'idle' : prev));
    });

    useSpeechRecognitionEvent('error', () => {
      setVoiceState('error');
    });

    const resetState = useCallback(() => {
      setVoiceState('idle');
      setTranscript('');
      setVoiceResult(null);
      setPendingItems([]);
      setPendingBudgets([]);
    }, []);

    const startListening = useCallback(async () => {
      const available = await ExpoSpeechRecognitionModule.isAvailableAsync?.() ?? true;
      if (!available) { setVoiceState('unavailable'); return; }
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) { setVoiceState('error'); return; }
      setTranscript('');
      setVoiceResult(null);
      setPendingItems([]);
      setPendingBudgets([]);
      setVoiceState('listening');
      ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true, continuous: false });
      haptic.medium();
    }, []);

    const stopListening = useCallback(() => {
      ExpoSpeechRecognitionModule.stop();
    }, []);

    const removeItem = useCallback((index: number) => {
      setPendingItems(prev => {
        const next = prev.filter((_, i) => i !== index);
        if (next.length === 0) {
          setVoiceState('idle');
          setTranscript('');
          setVoiceResult(null);
        }
        return next;
      });
    }, []);

    const removeBudget = useCallback((index: number) => {
      setPendingBudgets(prev => {
        const next = prev.filter((_, i) => i !== index);
        if (next.length === 0) {
          setVoiceState('idle');
          setTranscript('');
          setVoiceResult(null);
        }
        return next;
      });
    }, []);

    const handleLogAll = useCallback(async () => {
      const validItems = pendingItems.filter((i): i is LogItem & { amount: number } => !!i.amount);
      if (validItems.length === 0 || saving) return;
      setSaving(true);
      haptic.medium();

      const { month, year } = getCurrentMonth();
      let lastNudge: NudgeResult | null = null;

      try {
        for (const item of validItems) {
          const categoryId = item.categoryId ?? 'other';
          const paymentMethod = item.paymentMethod ?? 'UPI';

          await addTransaction({
            amount: item.amount,
            categoryId,
            merchant: item.merchant,
            date: Date.now(),
            paymentMethod,
            notes: item.notes,
          });
          await setSetting('last_category_id', categoryId);
          await setSetting('last_payment_method', paymentMethod);

          const catTransactions = allTransactions.filter(t => {
            if (t.categoryId !== categoryId) return false;
            const d = new Date(t.date);
            return d.getMonth() + 1 === month && d.getFullYear() === year;
          });
          const categoryBudget = allBudgets.find(
            b => b.categoryId === categoryId && b.month === month && b.year === year
          )?.amount ?? null;
          const categorySpent = catTransactions.reduce((s, t) => s + t.amount, 0) + item.amount;
          const now = new Date();
          const todayCount = catTransactions.filter(t => {
            const d = new Date(t.date);
            return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length + 1;

          const cat = categories.find(c => c.id === categoryId);
          lastNudge = computeNudge({
            transactionAmount: item.amount,
            categorySpentTotal: categorySpent,
            categoryBudget,
            categoryName: cat?.name ?? 'this',
            sameCategoryTodayCount: todayCount,
          });
        }

        sheetRef.current?.dismiss();
        if (lastNudge) onExpenseSaved?.(lastNudge);
      } catch (e) {
        console.error('VoiceExpenseSheet save error:', e);
      } finally {
        setSaving(false);
      }
    }, [pendingItems, saving, addTransaction, setSetting, allTransactions, allBudgets, categories, onExpenseSaved]);

    const handleEditFirst = useCallback(() => {
      if (pendingItems.length !== 1) return;
      const item = pendingItems[0];
      onEditFirst?.({
        amount: String(item.amount ?? ''),
        categoryId: item.categoryId ?? 'other',
        merchant: item.merchant,
        paymentMethod: item.paymentMethod,
        notes: item.notes,
      });
      sheetRef.current?.dismiss();
    }, [pendingItems, onEditFirst]);

    const handleSetBudgets = useCallback(async () => {
      const validBudgets = pendingBudgets.filter(
        (b): b is BudgetItem & { amount: number; categoryId: string } => !!(b.amount && b.categoryId)
      );
      if (validBudgets.length === 0 || saving) return;
      setSaving(true);
      haptic.medium();

      const { month: currentMonth, year: currentYear } = getCurrentMonth();

      try {
        for (const item of validBudgets) {
          const month = item.month ?? currentMonth;
          const year = item.year ?? currentYear;
          const existing = allBudgets.find(
            b => b.categoryId === item.categoryId && b.month === month && b.year === year
          );
          if (existing) {
            await updateBudget(existing.id, { amount: item.amount });
          } else {
            await addBudget({ categoryId: item.categoryId, amount: item.amount, month, year });
          }
        }
        sheetRef.current?.dismiss();
      } catch (e) {
        console.error('VoiceExpenseSheet budget save error:', e);
      } finally {
        setSaving(false);
      }
    }, [pendingBudgets, saving, allBudgets, addBudget, updateBudget]);

    useImperativeHandle(ref, () => ({
      present: () => { resetState(); sheetRef.current?.present(); },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const singleItem = pendingItems.length === 1 ? pendingItems[0] : null;
    const selectedCategory = singleItem?.categoryId
      ? categories.find(c => c.id === singleItem.categoryId)
      : null;

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['65%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: Colors.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        handleIndicatorStyle={{ backgroundColor: Colors.textMuted, width: 36 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
        )}
        onDismiss={() => {
          if (voiceState === 'listening') ExpoSpeechRecognitionModule.abort();
          resetState();
        }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: Spacing.md, paddingTop: 8, paddingBottom: 48, alignItems: 'center' }}>
          <H3 style={{ marginBottom: Spacing.xl, alignSelf: 'flex-start' }}>Voice assistant</H3>

          {/* ── Idle ── */}
          {voiceState === 'idle' && (
            <>
              <Pressable
                onPress={startListening}
                style={{
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: Colors.surface2,
                  borderWidth: 1.5, borderColor: Colors.border,
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: Spacing.lg,
                }}
              >
                <Ionicons name="mic-outline" size={30} color={Colors.textPrimary} />
              </Pressable>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                Log expenses, set budgets, or ask about your spending{'\n'}
                <Text style={{ color: Colors.textMuted }}>"₹200 on coffee and ₹500 on groceries"</Text>
                {'\n'}
                <Text style={{ color: Colors.textMuted }}>"Set food budget to ₹5000"</Text>
              </Text>
            </>
          )}

          {/* ── Listening ── */}
          {voiceState === 'listening' && (
            <>
              <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg }}>
                <Animated.View style={[pulseStyle, { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primary }]} />
                <Pressable
                  onPress={stopListening}
                  style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="mic" size={30} color="#000" />
                </Pressable>
              </View>
              <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: Colors.textMuted, marginBottom: 12 }}>
                Listening... tap to stop
              </Text>
              {transcript ? (
                <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 16 }}>
                  {transcript}
                </Text>
              ) : null}
            </>
          )}

          {/* ── Parsing ── */}
          {voiceState === 'parsing' && (
            <>
              <ActivityIndicator color={Colors.primary} size="large" style={{ marginBottom: Spacing.lg }} />
              <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.textSecondary }}>
                Thinking...
              </Text>
              {transcript ? (
                <Caption style={{ marginTop: 8, textAlign: 'center', paddingHorizontal: 16 }}>"{transcript}"</Caption>
              ) : null}
            </>
          )}

          {/* ── Log result ── */}
          {voiceState === 'log_result' && pendingItems.length > 0 && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              {pendingItems.length === 1 ? (
                <>
                  {singleItem?.amount ? (
                    <Text style={{ fontFamily: Fonts.bold, fontSize: 52, color: Colors.textPrimary, marginBottom: 6 }}>
                      ₹{Number.isInteger(singleItem.amount) ? singleItem.amount : singleItem.amount!.toFixed(2)}
                    </Text>
                  ) : (
                    <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: Colors.red, marginBottom: 6 }}>
                      No amount detected
                    </Text>
                  )}

                  {selectedCategory ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Text style={{ fontSize: 18 }}>{selectedCategory.icon}</Text>
                      <Text style={{ fontFamily: Fonts.medium, fontSize: 16, color: Colors.textSecondary }}>
                        {selectedCategory.name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: Colors.textMuted, marginBottom: 4 }}>
                      No category matched — will use Other
                    </Text>
                  )}

                  {singleItem?.merchant ? <Caption style={{ marginBottom: 2 }}>{singleItem.merchant}</Caption> : null}
                  {singleItem?.notes ? <Caption style={{ marginBottom: 2, color: Colors.textMuted }}>{singleItem.notes}</Caption> : null}
                  {singleItem?.paymentMethod ? (
                    <Caption style={{ marginBottom: Spacing.xl, color: Colors.textMuted }}>{singleItem.paymentMethod}</Caption>
                  ) : (
                    <View style={{ marginBottom: Spacing.xl }} />
                  )}

                  <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                    <View style={{ flex: 1 }}>
                      <Button onPress={handleEditFirst} variant="secondary" fullWidth>Edit</Button>
                    </View>
                    <View style={{ flex: 2 }}>
                      <Button onPress={handleLogAll} disabled={!singleItem?.amount} loading={saving} fullWidth>
                        Log it
                      </Button>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <ScrollView style={{ width: '100%', maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                    {pendingItems.map((item, idx) => {
                      const cat = item.categoryId ? categories.find(c => c.id === item.categoryId) : null;
                      return (
                        <View
                          key={idx}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.border,
                          }}
                        >
                          <Text style={{ fontFamily: Fonts.semibold, fontSize: 15, color: Colors.textPrimary, width: 72 }}>
                            {item.amount ? `₹${item.amount}` : '—'}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              {cat ? <Text style={{ fontSize: 13 }}>{cat.icon}</Text> : null}
                              <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: Colors.textSecondary }}>
                                {cat?.name ?? 'Other'}
                              </Text>
                            </View>
                            {(item.merchant || item.notes) ? (
                              <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted }}>
                                {[item.merchant, item.notes].filter(Boolean).join(' · ')}
                              </Text>
                            ) : null}
                          </View>
                          <Pressable onPress={() => removeItem(idx)} style={{ padding: 8 }}>
                            <Ionicons name="close" size={16} color={Colors.textMuted} />
                          </Pressable>
                        </View>
                      );
                    })}
                  </ScrollView>
                  <View style={{ marginTop: Spacing.lg, width: '100%' }}>
                    <Button
                      onPress={handleLogAll}
                      disabled={!pendingItems.some(i => i.amount)}
                      loading={saving}
                      fullWidth
                    >
                      Log all ({pendingItems.length})
                    </Button>
                  </View>
                </>
              )}

              <Pressable onPress={resetState} style={{ marginTop: Spacing.md, padding: 4, alignSelf: 'center' }}>
                <Caption style={{ color: Colors.textMuted }}>Try again</Caption>
              </Pressable>
            </View>
          )}

          {/* ── Budget result ── */}
          {voiceState === 'budget_result' && pendingBudgets.length > 0 && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <ScrollView style={{ width: '100%', maxHeight: 240 }} showsVerticalScrollIndicator={false}>
                {pendingBudgets.map((item, idx) => {
                  const cat = item.categoryId ? categories.find(c => c.id === item.categoryId) : null;
                  const { month: currentMonth, year: currentYear } = getCurrentMonth();
                  const month = item.month ?? currentMonth;
                  const year = item.year ?? currentYear;
                  const isCurrentMonth = month === currentMonth && year === currentYear;
                  const monthLabel = isCurrentMonth
                    ? 'This month'
                    : new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

                  return (
                    <View
                      key={idx}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.border,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          {cat ? <Text style={{ fontSize: 16 }}>{cat.icon}</Text> : null}
                          <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: Colors.textPrimary }}>
                            {cat?.name ?? 'Unknown category'}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
                          {monthLabel}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary }}>
                        {item.amount ? `₹${item.amount.toLocaleString('en-IN')}` : '—'}
                      </Text>
                      <Pressable onPress={() => removeBudget(idx)} style={{ padding: 8, marginLeft: 8 }}>
                        <Ionicons name="close" size={16} color={Colors.textMuted} />
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
              <View style={{ marginTop: Spacing.lg, width: '100%' }}>
                <Button
                  onPress={handleSetBudgets}
                  disabled={!pendingBudgets.some(b => b.amount && b.categoryId)}
                  loading={saving}
                  fullWidth
                >
                  Set budget{pendingBudgets.length > 1 ? 's' : ''} ({pendingBudgets.length})
                </Button>
              </View>
              <Pressable onPress={resetState} style={{ marginTop: Spacing.md, padding: 4, alignSelf: 'center' }}>
                <Caption style={{ color: Colors.textMuted }}>Try again</Caption>
              </Pressable>
            </View>
          )}

          {/* ── Query result ── */}
          {voiceState === 'query_result' && voiceResult?.intent === 'query' && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Ionicons name="stats-chart" size={28} color={Colors.primary} style={{ marginBottom: Spacing.md }} />

              {transcript ? (
                <Caption style={{ marginBottom: Spacing.md, textAlign: 'center', paddingHorizontal: 8 }}>
                  "{transcript}"
                </Caption>
              ) : null}

              <Text style={{
                fontFamily: Fonts.medium,
                fontSize: 16,
                color: Colors.textPrimary,
                textAlign: 'center',
                lineHeight: 24,
                paddingHorizontal: 8,
                marginBottom: Spacing.xl,
              }}>
                {voiceResult.answer}
              </Text>

              <Button onPress={resetState} fullWidth>Ask another</Button>
            </View>
          )}

          {/* ── Unavailable (simulator) ── */}
          {voiceState === 'unavailable' && (
            <>
              <Ionicons name="phone-portrait-outline" size={40} color={Colors.textMuted} style={{ marginBottom: Spacing.md }} />
              <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: Colors.textSecondary, textAlign: 'center' }}>
                Voice input requires a physical device.{'\n'}Speech recognition isn't available on the simulator.
              </Text>
            </>
          )}

          {/* ── Error ── */}
          {voiceState === 'error' && (
            <>
              <Ionicons name="mic-off-outline" size={40} color={Colors.textMuted} style={{ marginBottom: Spacing.md }} />
              <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: Colors.textSecondary, marginBottom: Spacing.lg, textAlign: 'center' }}>
                Something went wrong.{'\n'}Check mic permissions and try again.
              </Text>
              <Button onPress={resetState} fullWidth>Try again</Button>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
