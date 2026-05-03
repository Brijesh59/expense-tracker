import '../../global.css';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { useLumaStore } from '@/db/store';
import { Storage } from '@/db/storage';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { setupNotifications } from '@/services/notifications';
import { setIntendedDestination, registerOverlayHider, hideLaunchCover } from '@/utils/splash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const initialize = useLumaStore(s => s.initialize);
  const [ready, setReady] = useState(false);
  const [destination, setDestination] = useState<'/(tabs)' | '/onboarding/welcome' | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const launched = await Storage.hasLaunched();
        setIntendedDestination(launched ? 'tabs' : 'onboarding');
        setDestination(launched ? '/(tabs)' : '/onboarding/welcome');
        await initialize();
        await setupNotifications();
      } catch (e) {
        console.error('Init error:', e);
        setIntendedDestination('onboarding');
        setDestination('/onboarding/welcome');
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded && ready && destination) {
      router.replace(destination);
    }
  }, [fontsLoaded, ready, destination]);

  // Safety fallback — hide splash after 5s no matter what
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      hideLaunchCover();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded || !ready) return null;

  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { colors, isDark } = useTheme();
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    registerOverlayHider(() => setOverlayVisible(false));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="budget" />
          </Stack>

          {/* Covers any flash of the wrong screen during initial navigation */}
          {overlayVisible && (
            <View
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: colors.background,
              }}
              pointerEvents="none"
            />
          )}
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
