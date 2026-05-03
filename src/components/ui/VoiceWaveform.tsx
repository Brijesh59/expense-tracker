import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface VoiceWaveformProps {
  volume: number; // 0..1 from useAudioMeter
  color: string;
}

// Each bar: natural height and how strongly it reacts to volume (weight)
const BARS = [
  { height: 14, weight: 0.45 },
  { height: 26, weight: 0.75 },
  { height: 36, weight: 1.00 },
  { height: 22, weight: 0.68 },
  { height: 12, weight: 0.38 },
];

const BASE_SCALE = 0.12;
const SPRING = { damping: 10, stiffness: 180, mass: 0.4 };

function WaveBar({ height, weight, volume, color }: {
  height: number;
  weight: number;
  volume: number;
  color: string;
}) {
  const scale = useSharedValue(BASE_SCALE);

  useEffect(() => {
    scale.value = withSpring(BASE_SCALE + volume * weight * (1 - BASE_SCALE), SPRING);
  }, [volume]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  return (
    <Animated.View style={[style, { width: 4, height, borderRadius: 4, backgroundColor: color }]} />
  );
}

export function VoiceWaveform({ volume, color }: VoiceWaveformProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 40 }}>
      {BARS.map((bar, i) => (
        <WaveBar key={i} {...bar} volume={volume} color={color} />
      ))}
    </View>
  );
}
