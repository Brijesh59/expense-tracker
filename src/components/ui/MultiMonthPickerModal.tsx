import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { haptic } from '@/utils/haptics';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;

interface MonthEntry {
  month: number;
  year: number;
  label: string;
}

function buildMonthList(): MonthEntry[] {
  const now = new Date();
  const entries: MonthEntry[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    entries.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    });
  }
  return entries;
}

const MONTHS = buildMonthList();

export interface MultiMonthPickerModalProps {
  visible: boolean;
  selectedMonths: { month: number; year: number }[];
  onToggle: (month: number, year: number) => void;
  onClear: () => void;
  onClose: () => void;
}

export function MultiMonthPickerModal({
  visible,
  selectedMonths,
  onToggle,
  onClear,
  onClose,
}: MultiMonthPickerModalProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      duration: visible ? 280 : 220,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const isSelected = (month: number, year: number) =>
    selectedMonths.some(m => m.month === month && m.year === year);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
      >
        <Pressable onPress={() => {}}>
          <Animated.View
            style={{
              transform: [{ translateY }],
              height: SHEET_HEIGHT,
              backgroundColor: Colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: 'hidden',
            }}
          >
            {/* Handle */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border }} />
            </View>

            {/* Title row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: Spacing.md,
                paddingBottom: Spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <Text style={{ fontFamily: Fonts.semibold, fontSize: 16, color: Colors.textPrimary }}>
                Filter by month
              </Text>
              {selectedMonths.length > 0 && (
                <Pressable onPress={() => { haptic.light(); onClear(); }}>
                  <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.primary }}>
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>

            <FlatList
              data={MONTHS}
              keyExtractor={(item) => `${item.year}-${item.month}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
              renderItem={({ item }) => {
                const selected = isSelected(item.month, item.year);
                return (
                  <Pressable
                    onPress={() => { haptic.light(); onToggle(item.month, item.year); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: Spacing.md,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border,
                      backgroundColor: selected ? `${Colors.primary}14` : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: selected ? Fonts.semibold : Fonts.regular,
                        fontSize: 15,
                        color: selected ? Colors.primary : Colors.textPrimary,
                      }}
                    >
                      {item.label}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={18} color={Colors.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
