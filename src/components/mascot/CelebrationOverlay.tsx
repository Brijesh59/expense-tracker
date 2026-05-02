import React, { useEffect } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { H2, Body } from '@/components/ui/Typography';
import { LumaCat } from './LumaCat';
import { haptic } from '@/utils/haptics';

interface CelebrationOverlayProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

export function CelebrationOverlay({ visible, message, onDismiss }: CelebrationOverlayProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      haptic.success();
      scale.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 300 });

      const timer = setTimeout(() => {
        scale.value = withTiming(0.9, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 });
        setTimeout(onDismiss, 280);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.75)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[
            containerStyle,
            {
              backgroundColor: Colors.surface,
              borderRadius: Radius.xl,
              padding: Spacing.xl,
              alignItems: 'center',
              gap: Spacing.md,
              maxWidth: 300,
              borderWidth: 1,
              borderColor: `${Colors.primary}40`,
            },
          ]}
        >
          <Text style={{ fontSize: 48 }}>🎊</Text>
          <LumaCat state="celebrating" size={72} />
          <H2 style={{ textAlign: 'center' }}>{message}</H2>
          <Body color={Colors.textSecondary} style={{ textAlign: 'center', fontSize: 13 }}>
            Tap anywhere to dismiss
          </Body>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
