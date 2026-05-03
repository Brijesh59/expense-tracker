import React, { useCallback, useRef } from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { BodyMedium, Caption } from '@/components/ui/Typography';
import { useSettings } from '@/hooks/useSettings';
import { useLumaStore } from '@/db/store';
import { haptic } from '@/utils/haptics';
import { setIntendedDestination } from '@/utils/splash';
import { type CurrencyCode } from '@/utils/currency';
import { useCurrency } from '@/hooks/useCurrency';
import { WorkspaceSheet, WorkspaceSheetRef } from '@/components/sheets/WorkspaceSheet';
import { CurrencyPickerSheet, CurrencyPickerSheetRef } from '@/components/sheets/CurrencyPickerSheet';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: IoniconName }[] = [
  { label: 'System', value: 'system', icon: 'contrast-outline' },
  { label: 'Light',  value: 'light',  icon: 'sunny-outline' },
  { label: 'Dark',   value: 'dark',   icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { colors, mode: themeMode, isDark, setMode: setThemeMode } = useTheme();
  const { setSetting } = useSettings();
  const resetData = useLumaStore(s => s.resetData);
  const resetAll = useLumaStore(s => s.resetAll);
  const workspaces = useLumaStore(s => s.workspaces);
  const currentWorkspaceId = useLumaStore(s => s.currentWorkspaceId);
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);
  const workspaceSheetRef = useRef<WorkspaceSheetRef>(null);
  const currencySheetRef = useRef<CurrencyPickerSheetRef>(null);
  const { currency } = useCurrency();

  const handleCurrencyChange = useCallback(async (c: CurrencyCode) => {
    await setSetting('currency', c);
    haptic.success();
  }, [setSetting]);

  const handleResetApp = useCallback(() => {
    Alert.alert(
      'Reset app?',
      'This will wipe all data and restart the onboarding flow. Use this for testing only.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            haptic.warning();
            await resetAll();
            setIntendedDestination('onboarding');
            router.replace('/onboarding/welcome');
          },
        },
      ]
    );
  }, [resetAll]);

  const handleThemeChange = (mode: ThemeMode) => {
    haptic.light();
    setThemeMode(mode);
  };

  const handleReset = useCallback(() => {
    Alert.alert(
      'Delete all data?',
      'This will permanently delete all your transactions and budgets. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptic.warning();
            await resetData();
          },
        },
      ]
    );
  }, [resetData]);

  const row = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.md,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const selectedThemeSurface = isDark ? `${colors.primary}18` : '#FFF8D7';
  const unselectedThemeSurface = isDark ? colors.surface2 : '#F2F6F9';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md }}>
          <Text style={{ fontSize: 34, fontFamily: Fonts.bold, color: colors.textPrimary }}>Settings</Text>
        </View>

        {/* Workspace */}
        <Pressable
          onPress={() => { haptic.light(); workspaceSheetRef.current?.present(); }}
          style={row}
        >
          <BodyMedium>Workspace</BodyMedium>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Caption color={colors.primary}>{currentWorkspace?.name ?? 'Personal'}</Caption>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>

        {/* Currency */}
        <Pressable
          onPress={() => { haptic.light(); currencySheetRef.current?.present(); }}
          style={row}
        >
          <BodyMedium>Currency</BodyMedium>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Caption color={colors.primary}>{currency}</Caption>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>

        {/* Categories */}
        <Pressable
          onPress={() => router.push('/settings/categories')}
          style={row}
        >
          <BodyMedium>Categories</BodyMedium>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>

        {/* Theme */}
        <View style={{ paddingHorizontal: Spacing.md, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <BodyMedium style={{ marginBottom: 12 }}>Theme</BodyMedium>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {THEME_OPTIONS.map(opt => {
              const isSelected = themeMode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleThemeChange(opt.value)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: Radius.md,
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? selectedThemeSurface : unselectedThemeSurface,
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontFamily: isSelected ? Fonts.semibold : Fonts.regular,
                      fontSize: 12,
                      color: isSelected ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Reset */}
        <Pressable onPress={handleReset} style={row}>
          <BodyMedium color={colors.red}>Reset all data</BodyMedium>
        </Pressable>

        {/* About */}
        <View style={{ paddingHorizontal: Spacing.md, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <BodyMedium>About Luma</BodyMedium>
          <Caption style={{ marginTop: 4 }}>Version 1.0.0</Caption>
          <Caption style={{ marginTop: 2 }}>Clarity over complexity.</Caption>
        </View>

        {/* Developer */}
        <View style={{ paddingHorizontal: Spacing.md, paddingTop: 24, paddingBottom: 8 }}>
          <Text style={{ fontFamily: Fonts.semibold, fontSize: 11, color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
            Developer
          </Text>
        </View>
        <Pressable onPress={handleResetApp} style={row}>
          <View>
            <BodyMedium color={colors.red}>Reset app</BodyMedium>
            <Caption style={{ marginTop: 2 }}>Wipes all data and restarts onboarding</Caption>
          </View>
        </Pressable>
      </ScrollView>

      <WorkspaceSheet ref={workspaceSheetRef} />
      <CurrencyPickerSheet
        ref={currencySheetRef}
        selected={currency}
        onSelect={handleCurrencyChange}
      />
    </SafeAreaView>
  );
}
