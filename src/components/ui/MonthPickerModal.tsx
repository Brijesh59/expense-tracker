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
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;

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

interface MonthPickerModalProps {
  visible: boolean;
  month: number;
  year: number;
  onSelect: (month: number, year: number) => void;
  onClose: () => void;
}

export function MonthPickerModal({ visible, month, year, onSelect, onClose }: MonthPickerModalProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 26,
        stiffness: 220,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
      >
        {/* Sheet — stop propagation so tapping inside doesn't close */}
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
            {/* Handle bar */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.border,
                }}
              />
            </View>

            {/* Title */}
            <View
              style={{
                paddingHorizontal: Spacing.md,
                paddingBottom: Spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  fontSize: 16,
                  color: Colors.textPrimary,
                }}
              >
                Select month
              </Text>
            </View>

            {/* Month list */}
            <FlatList
              data={MONTHS}
              keyExtractor={(item) => `${item.year}-${item.month}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
              renderItem={({ item }) => {
                const isSelected = item.month === month && item.year === year;
                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item.month, item.year);
                      onClose();
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: Spacing.md,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border,
                      backgroundColor: isSelected ? `${Colors.primary}14` : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: isSelected ? Fonts.semibold : Fonts.regular,
                        fontSize: 15,
                        color: isSelected ? Colors.primary : Colors.textPrimary,
                      }}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Text style={{ color: Colors.primary, fontSize: 16 }}>✓</Text>
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
