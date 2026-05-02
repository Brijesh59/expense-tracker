import React, { useState, useCallback, forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
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
import { processVoiceInput, VoiceResult } from '@/utils/parseVoiceExpense';

export interface VoiceExpenseSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface VoiceExpenseSheetProps {
  onExpenseSaved?: (nudge: NudgeResult) => void;
  onEditFirst?: (prefill: { amount: string; categoryId: string; merchant: string; paymentMethod: string | null; notes: string }) => void;
}

type VoiceState = 'idle' | 'listening' | 'parsing' | 'log_result' | 'query_result' | 'error' | 'unavailable';

export const VoiceExpenseSheet = forwardRef<VoiceExpenseSheetRef, VoiceExpenseSheetProps>(
  ({ onExpenseSaved, onEditFirst }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const categories = useCategories();
    const addTransaction = useLumaStore(s => s.addTransaction);
    const setSetting = useLumaStore(s => s.setSetting);
    const allTransactions = useLumaStore(s => s.transactions);
    const allBudgets = useLumaStore(s => s.budgets);

    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState('');
    const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
    const [saving, setSaving] = useState(false);

    // Pulsing ring for listening state
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
            setVoiceState(result.intent === 'log' ? 'log_result' : 'query_result');
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
    }, []);

    const startListening = useCallback(async () => {
      const available = await ExpoSpeechRecognitionModule.isAvailableAsync?.() ?? true;
      if (!available) { setVoiceState('unavailable'); return; }
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) { setVoiceState('error'); return; }
      setTranscript('');
      setVoiceResult(null);
      setVoiceState('listening');
      ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true, continuous: false });
      haptic.medium();
    }, []);

    const stopListening = useCallback(() => {
      ExpoSpeechRecognitionModule.stop();
    }, []);

    // Narrow to log intent for save/edit handlers
    const logResult = voiceResult?.intent === 'log' ? voiceResult : null;

    const handleLogIt = useCallback(async () => {
      if (!logResult?.amount || saving) return;
      setSaving(true);
      haptic.medium();

      const categoryId = logResult.categoryId ?? 'other';
      const paymentMethod = logResult.paymentMethod ?? 'UPI';
      const { month, year } = getCurrentMonth();

      try {
        await addTransaction({
          amount: logResult.amount,
          categoryId,
          merchant: logResult.merchant,
          date: Date.now(),
          paymentMethod,
          notes: logResult.notes,
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
        const categorySpent = catTransactions.reduce((s, t) => s + t.amount, 0) + logResult.amount;
        const now = new Date();
        const todayCount = catTransactions.filter(t => {
          const d = new Date(t.date);
          return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length + 1;

        const selectedCategory = categories.find(c => c.id === categoryId);
        const nudge = computeNudge({
          transactionAmount: logResult.amount,
          categorySpentTotal: categorySpent,
          categoryBudget,
          categoryName: selectedCategory?.name ?? 'this',
          sameCategoryTodayCount: todayCount,
        });

        sheetRef.current?.dismiss();
        onExpenseSaved?.(nudge);
      } catch (e) {
        console.error('VoiceExpenseSheet save error:', e);
      } finally {
        setSaving(false);
      }
    }, [logResult, saving, addTransaction, setSetting, allTransactions, allBudgets, categories, onExpenseSaved]);

    const handleEditFirst = useCallback(() => {
      if (!logResult) return;
      onEditFirst?.({
        amount: String(logResult.amount ?? ''),
        categoryId: logResult.categoryId ?? 'other',
        merchant: logResult.merchant,
        paymentMethod: logResult.paymentMethod,
        notes: logResult.notes,
      });
      sheetRef.current?.dismiss();
    }, [logResult, onEditFirst]);

    useImperativeHandle(ref, () => ({
      present: () => { resetState(); sheetRef.current?.present(); },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const selectedCategory = logResult?.categoryId
      ? categories.find(c => c.id === logResult.categoryId)
      : null;

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['55%']}
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
                Log an expense or ask about your spending{'\n'}
                <Text style={{ color: Colors.textMuted }}>"₹200 on coffee at Starbucks"</Text>
                {'\n'}
                <Text style={{ color: Colors.textMuted }}>"How much did I spend on clothes?"</Text>
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
          {voiceState === 'log_result' && logResult && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              {logResult.amount ? (
                <Text style={{ fontFamily: Fonts.bold, fontSize: 52, color: Colors.textPrimary, marginBottom: 6 }}>
                  ₹{Number.isInteger(logResult.amount) ? logResult.amount : logResult.amount.toFixed(2)}
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

              {logResult.merchant ? <Caption style={{ marginBottom: 2 }}>{logResult.merchant}</Caption> : null}
              {logResult.notes ? <Caption style={{ marginBottom: 2, color: Colors.textMuted }}>{logResult.notes}</Caption> : null}
              {logResult.paymentMethod ? (
                <Caption style={{ marginBottom: Spacing.xl, color: Colors.textMuted }}>{logResult.paymentMethod}</Caption>
              ) : (
                <View style={{ marginBottom: Spacing.xl }} />
              )}

              <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                <View style={{ flex: 1 }}>
                  <Button onPress={handleEditFirst} variant="secondary" fullWidth>Edit</Button>
                </View>
                <View style={{ flex: 2 }}>
                  <Button onPress={handleLogIt} disabled={!logResult.amount} loading={saving} fullWidth>
                    Log it
                  </Button>
                </View>
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
              <Button onPress={resetState}>Try again</Button>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
