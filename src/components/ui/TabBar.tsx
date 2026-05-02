import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { haptic } from '@/utils/haptics';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS_ACTIVE: Record<string, IoniconName> = {
  index: 'home',
  transactions: 'receipt',
  budgets: 'wallet',
  insights: 'bar-chart',
};

const TAB_ICONS_INACTIVE: Record<string, IoniconName> = {
  index: 'home-outline',
  transactions: 'receipt-outline',
  budgets: 'wallet-outline',
  insights: 'bar-chart-outline',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Overview',
  transactions: 'Expenses',
  budgets: 'Budgets',
  insights: 'Insights',
};

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabItem({ routeName, isFocused, onPress }: TabItemProps) {
  const { colors } = useTheme();
  const dotOpacity = useSharedValue(isFocused ? 1 : 0);
  const iconScale = useSharedValue(isFocused ? 1.08 : 1);

  React.useEffect(() => {
    const config = { duration: 180, easing: Easing.out(Easing.cubic) };
    dotOpacity.value = withTiming(isFocused ? 1 : 0, config);
    iconScale.value = withTiming(isFocused ? 1.08 : 1, config);
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <Pressable
      onPress={() => { haptic.light(); onPress(); }}
      style={{ flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4, gap: 4 }}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isFocused
            ? (TAB_ICONS_ACTIVE[routeName] ?? 'ellipse')
            : (TAB_ICONS_INACTIVE[routeName] ?? 'ellipse-outline')}
          size={22}
          color={isFocused ? colors.textPrimary : colors.textMuted}
        />
      </Animated.View>

      <Text
        style={{
          fontFamily: isFocused ? Fonts.semibold : Fonts.regular,
          fontSize: 10,
          color: isFocused ? colors.textPrimary : colors.textMuted,
          letterSpacing: 0.2,
        }}
        numberOfLines={1}
      >
        {TAB_LABELS[routeName] ?? routeName}
      </Text>

      <Animated.View
        style={[
          dotStyle,
          {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.primary,
          },
        ]}
      />
    </Pressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <BlurView
      intensity={80}
      tint={isDark ? 'dark' : 'light'}
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
      }}
    >
      {state.routes.filter(r => !['settings', 'budgets', 'insights'].includes(r.name)).map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            routeName={route.name}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </BlurView>
  );
}
