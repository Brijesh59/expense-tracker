import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

interface LunaMascotProps {
  size?: number;
}

export function LunaMascot({ size = 112 }: LunaMascotProps) {
  const eyeOffset = useSharedValue(0);
  const eyeScale = useSharedValue(1);
  const floatY = useSharedValue(0);

  React.useEffect(() => {
    const easing = Easing.inOut(Easing.cubic);

    eyeOffset.value = withRepeat(
      withSequence(
        withTiming(-16, { duration: 720, easing }),
        withDelay(420, withTiming(-16, { duration: 1 })),
        withTiming(18, { duration: 880, easing }),
        withDelay(420, withTiming(18, { duration: 1 })),
        withTiming(0, { duration: 680, easing }),
        withDelay(900, withTiming(0, { duration: 1 }))
      ),
      -1
    );

    eyeScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 720, easing }),
        withDelay(420, withTiming(1.08, { duration: 1 })),
        withTiming(0.9, { duration: 880, easing }),
        withDelay(420, withTiming(0.9, { duration: 1 })),
        withTiming(1, { duration: 680, easing }),
        withDelay(900, withTiming(1, { duration: 1 }))
      ),
      -1
    );

    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1600, easing }),
        withTiming(0, { duration: 1600, easing })
      ),
      -1,
      true
    );
  }, [eyeOffset, eyeScale, floatY]);

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const leftEyeProps = useAnimatedProps(() => ({
    cx: 534 + eyeOffset.value,
    rx: 81 * eyeScale.value,
    ry: 120 * eyeScale.value,
  }));

  const rightEyeProps = useAnimatedProps(() => ({
    cx: 777 + eyeOffset.value,
    rx: 70 * eyeScale.value,
    ry: 111 * eyeScale.value,
  }));

  return (
    <Animated.View
      accessible
      accessibilityLabel="Luna mascot"
      style={[wrapperStyle, { width: size, height: size }]}
    >
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="118 142 820 882" fill="none">
          <Path
            d="M137 1024V704C137 657 145 615 161 581C145 509 134 443 134 363C134 245 160 183 202 166C263 141 336 208 410 329C462 318 529 312 592 318C615 225 639 178 673 166C730 145 788 212 833 322C859 386 874 465 875 535C900 586 909 660 922 731C934 794 907 856 847 904C776 961 672 990 533 998C458 1002 374 1002 280 1001C230 1001 182 1002 137 1024Z"
            fill="#F5E12A"
          />
          <AnimatedEllipse
            animatedProps={leftEyeProps}
            cy={685}
            fill="#3A1DB3"
          />
          <AnimatedEllipse
            animatedProps={rightEyeProps}
            cy={685}
            fill="#3A1DB3"
          />
        </Svg>
      </View>
    </Animated.View>
  );
}
