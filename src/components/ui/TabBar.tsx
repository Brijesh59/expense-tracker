import React, { useRef } from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '@/constants/theme';
import { springs } from '@/constants/animations';
import { haptic } from '@/utils/haptics';

const TAB_ICONS: Record<string, string> = {
  index: '⌂',
  transactions: '≡',
  budgets: '◎',
  insights: '↗',
  settings: '⚙',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Overview',
  transactions: 'Transactions',
  budgets: 'Budgets',
  insights: 'Insights',
  settings: 'Settings',
};

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabItem({ routeName, isFocused, onPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const dotOpacity = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.12 : 1, springs.snappy);
    translateY.value = withSpring(isFocused ? -3 : 0, springs.snappy);
    dotOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={{ flex: 1, alignItems: 'center', paddingVertical: 8, gap: 4 }}
    >
      <Animated.Text
        style={[
          iconStyle,
          {
            fontSize: 20,
            color: isFocused ? Colors.primary : Colors.textMuted,
          },
        ]}
      >
        {TAB_ICONS[routeName] ?? '○'}
      </Animated.Text>
      <Text
        style={{
          fontFamily: isFocused ? Fonts.medium : Fonts.regular,
          fontSize: 10,
          color: isFocused ? Colors.primary : Colors.textMuted,
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
            backgroundColor: Colors.primary,
            marginTop: -2,
          },
        ]}
      />
    </Pressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        paddingTop: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const routeName = route.name;

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
            routeName={routeName}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}
