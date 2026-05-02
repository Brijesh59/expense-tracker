import React from 'react';
import { View, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { haptic } from '@/utils/haptics';

interface BottomBarProps extends BottomTabBarProps {
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
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isHome = !pathname.includes('transactions') && !pathname.includes('insights');
  const isTransactions = pathname.includes('transactions');
  const isInsights = pathname.includes('insights');

  return (
    <View
      pointerEvents="box-none"
      style={{
        height: Math.max(insets.bottom, 16) + 72,
        backgroundColor: 'transparent',
      }}
    >
      <View
        style={{
          position: 'absolute',
          bottom: Math.max(insets.bottom, 16),
          left: 20,
          right: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left group: + button and nav pill side by side */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* + button — standalone circle */}
          <Pressable
            onPress={() => { haptic.medium(); onAddPress(); }}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: Colors.surface,
              borderWidth: 1, borderColor: Colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={22} color={Colors.textPrimary} />
          </Pressable>

          {/* Nav pill: expenses + insights */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.surface,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: Colors.border,
              height: 44,
              paddingHorizontal: 6,
              gap: 2,
            }}
          >
            <Pressable
              onPress={() => { haptic.light(); router.navigate('/'); }}
              style={pillItem}
            >
              <Ionicons
                name={isHome ? 'easel' : 'easel-outline'}
                size={19}
                color={isHome ? Colors.textPrimary : Colors.textMuted}
              />
            </Pressable>

            <Pressable
              onPress={() => { haptic.light(); router.push('/transactions'); }}
              style={pillItem}
            >
              <Ionicons
                name={isTransactions ? 'receipt' : 'receipt-outline'}
                size={19}
                color={isTransactions ? Colors.textPrimary : Colors.textMuted}
              />
            </Pressable>

            <Pressable
              onPress={() => { haptic.light(); router.push('/insights'); }}
              style={pillItem}
            >
              <Ionicons
                name={isInsights ? 'trending-up' : 'trending-up-outline'}
                size={19}
                color={isInsights ? Colors.textPrimary : Colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* Mic — primary CTA */}
        <Pressable
          onPress={() => { haptic.medium(); onMicPress(); }}
          style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: Colors.primary,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="mic" size={24} color="#000" />
        </Pressable>
      </View>
    </View>
  );
}
