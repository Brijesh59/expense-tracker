import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useColorScheme, View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
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

const { width: W, height: H } = Dimensions.get('window');
// Radius must reach top-right corner from bottom-left origin
const MAX_R = Math.sqrt(W * W + H * H) * 1.05;

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Circle centred at bottom-left corner (0, H).
// Outer rect fills the whole screen; the circle punches a growing hole
// via the even-odd fill rule, revealing the new-theme content below.
function RevealOverlay({ oldBg, onDone }: { oldBg: string; onDone: () => void }) {
  const r = useSharedValue(0);

  useEffect(() => {
    r.value = withTiming(MAX_R, { duration: 600, easing: Easing.out(Easing.cubic) }, (done) => {
      if (done) runOnJS(onDone)();
    });
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const radius = r.value;
    // Outer rect (fills screen)
    const outer = `M 0 0 H ${W} V ${H} H 0 Z`;
    // Full circle centred at (0, H) using two arcs
    const circle =
      radius > 0
        ? `M ${-radius} ${H} A ${radius} ${radius} 0 1 0 ${radius} ${H} A ${radius} ${radius} 0 1 0 ${-radius} ${H} Z`
        : '';
    return { d: `${outer} ${circle}` };
  });

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatedPath animatedProps={animatedProps} fill={oldBg} fillRule="evenodd" />
    </Svg>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const getSetting = useLumaStore(s => s.getSetting);
  const setSetting = useLumaStore(s => s.setSetting);

  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = getSetting('theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    return 'system';
  });

  // Colour of the screen before the transition — drives the overlay
  const [prevBg, setPrevBg] = useState<string | null>(null);
  const transitioning = useRef(false);

  const finishTransition = useCallback(() => {
    setPrevBg(null);
    transitioning.current = false;
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    if (newMode === mode || transitioning.current) return;

    const sys = systemScheme ?? 'dark';
    const oldScheme = mode === 'system' ? sys : mode;
    const newScheme = newMode === 'system' ? sys : newMode;

    // No visual change (e.g. dark→system-dark or system-light→light) — skip animation
    if (oldScheme === newScheme) {
      setModeState(newMode);
      setSetting('theme', newMode);
      return;
    }

    transitioning.current = true;
    const oldBg = oldScheme === 'dark' ? darkColors.background : lightColors.background;

    // Switch theme immediately so new content renders behind the overlay
    setModeState(newMode);
    setSetting('theme', newMode);

    // Show overlay with old background — RevealOverlay will punch a growing hole
    setPrevBg(oldBg);
  }, [mode, systemScheme, setSetting]);

  const effectiveScheme = mode === 'system' ? (systemScheme ?? 'dark') : mode;
  const isDark = effectiveScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, mode, isDark, setMode }}>
      <View style={styles.root}>
        {children}
        {prevBg && <RevealOverlay key={prevBg} oldBg={prevBg} onDone={finishTransition} />}
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export function useTheme() {
  return useContext(ThemeContext);
}
