import React from 'react';
import { View, Pressable } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { haptic } from '@/utils/haptics';

interface BottomBarProps {
  onAddPress: () => void;
  onMicPress: () => void;
}

const pillItem = {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export function BottomBar({ onAddPress, onMicPress }: BottomBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isHome = !pathname.includes('transactions') && !pathname.includes('insights');
  const isTransactions = pathname.includes('transactions');
  const isInsights = pathname.includes('insights');

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Math.max(insets.bottom, 16),
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left group: + button and nav pill */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => { haptic.medium(); onAddPress(); }}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: colors.surface,
              borderWidth: 1, borderColor: colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={22} color={colors.textPrimary} />
          </Pressable>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: colors.border,
              height: 44,
              paddingHorizontal: 6,
              gap: 2,
            }}
          >
            <Pressable onPress={() => { haptic.light(); router.navigate('/'); }} style={pillItem}>
              <Ionicons
                name={isHome ? 'easel' : 'easel-outline'}
                size={19}
                color={isHome ? colors.textPrimary : colors.textMuted}
              />
            </Pressable>

            <Pressable onPress={() => { haptic.light(); router.push('/transactions'); }} style={pillItem}>
              <Ionicons
                name={isTransactions ? 'receipt' : 'receipt-outline'}
                size={19}
                color={isTransactions ? colors.textPrimary : colors.textMuted}
              />
            </Pressable>

            <Pressable onPress={() => { haptic.light(); router.push('/insights'); }} style={pillItem}>
              <Ionicons
                name={isInsights ? 'trending-up' : 'trending-up-outline'}
                size={19}
                color={isInsights ? colors.textPrimary : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* Mic — primary CTA */}
        <Pressable
          onPress={() => { haptic.medium(); onMicPress(); }}
          style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="mic" size={24} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}
