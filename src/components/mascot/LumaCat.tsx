import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { Caption } from '@/components/ui/Typography';
import { catCopy } from '@/constants/copy';

export type CatState = 'idle' | 'excited' | 'sleeping' | 'celebrating' | 'watching';

const CAT_EMOJI: Record<CatState, string> = {
  idle: '😺',
  excited: '😸',
  sleeping: '😴',
  celebrating: '🎉',
  watching: '👀',
};

interface LumaCatProps {
  state: CatState;
  size?: number;
}

export function LumaCat({ state, size = 64 }: LumaCatProps) {
  const floatY = useSharedValue(0);

  React.useEffect(() => {
    if (state === 'idle' || state === 'watching') {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );
    } else if (state === 'excited') {
      floatY.value = withRepeat(
        withSequence(
          withSpring(-10, { damping: 8, stiffness: 400 }),
          withSpring(0, { damping: 8, stiffness: 400 })
        ),
        -1,
        true
      );
    } else {
      floatY.value = withTiming(0, { duration: 300 });
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Animated.View
        style={[
          animatedStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: `${Colors.primary}20`,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: `${Colors.primary}30`,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.5 }}>{CAT_EMOJI[state]}</Text>
      </Animated.View>
      <Caption style={{ textAlign: 'center', maxWidth: 140 }}>
        {catCopy[state]}
      </Caption>
    </View>
  );
}
