import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useLumaStore } from '@/db/store';
import { darkColors, lightColors, type ThemeColors } from '@/constants/theme';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  mode: 'system',
  isDark: true,
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const getSetting = useLumaStore(s => s.getSetting);
  const setSetting = useLumaStore(s => s.setSetting);

  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = getSetting('theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    return 'system';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setSetting('theme', newMode);
  };

  const effectiveScheme = mode === 'system' ? (systemScheme ?? 'dark') : mode;
  const isDark = effectiveScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
