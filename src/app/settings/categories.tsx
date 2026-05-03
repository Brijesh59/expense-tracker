import React, { useRef } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { H2, BodyMedium } from '@/components/ui/Typography';
import { CategoryFormSheet, CategoryFormSheetRef } from '@/components/sheets/CategoryFormSheet';
import { useCategories } from '@/hooks/useCategories';
import { haptic } from '@/utils/haptics';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const categories = useCategories();
  const sheetRef = useRef<CategoryFormSheetRef>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.lg,
      }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4, marginRight: Spacing.sm }}>
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </Pressable>
        <H2 style={{ flex: 1 }}>Categories</H2>
        <Pressable
          onPress={() => { haptic.light(); sheetRef.current?.present(); }}
          style={{ padding: 4 }}
        >
          <Ionicons name="add" size={26} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 120 }}>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => {
              haptic.light();
              sheetRef.current?.present(cat);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: `${colors.border}60`,
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: `${cat.color}25`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
              <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <BodyMedium>{cat.name}</BodyMedium>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}

      </ScrollView>

      <CategoryFormSheet ref={sheetRef} />
    </SafeAreaView>
  );
}
