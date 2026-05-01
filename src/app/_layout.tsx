import '../../global.css';
import React, { useEffect, useState } from 'react';
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
import { Colors } from '@/constants/theme';
import { setupNotifications } from '@/services/notifications';

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
        // Read directly from AsyncStorage — no store dependency, no race condition
        const launched = await Storage.hasLaunched();
        setDestination(launched ? '/(tabs)' : '/onboarding/welcome');

        await initialize();
        await setupNotifications();
      } catch (e) {
        console.error('Init error:', e);
        setDestination('/onboarding/welcome');
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded && ready && destination) {
      SplashScreen.hideAsync();
      router.replace(destination);
    }
  }, [fontsLoaded, ready, destination]);

  // Safety fallback: force-hide splash after 5s
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded || !ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="budget" />
          </Stack>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
