import React from 'react';
import { Text, TextProps } from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  color?: string;
}

export function H1({ children, style, color, ...props }: TypographyProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        { fontFamily: Fonts.bold, fontSize: 28, color: color ?? colors.textPrimary, letterSpacing: -0.5 },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function H2({ children, style, color, ...props }: TypographyProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        { fontFamily: Fonts.semibold, fontSize: 22, color: color ?? colors.textPrimary, letterSpacing: -0.3 },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function H3({ children, style, color, ...props }: TypographyProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        { fontFamily: Fonts.semibold, fontSize: 17, color: color ?? colors.textPrimary },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Body({ children, style, color, ...props }: TypographyProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        { fontFamily: Fonts.regular, fontSize: 15, color: color ?? colors.textPrimary, lineHeight: 22 },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function BodyMedium({ children, style, color, ...props }: TypographyProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        { fontFamily: Fonts.medium, fontSize: 15, color: color ?? colors.textPrimary },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, style, color, ...props }: TypographyProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        { fontFamily: Fonts.regular, fontSize: 12, color: color ?? colors.textSecondary, lineHeight: 16 },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function AmountText({ children, style, color, ...props }: TypographyProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: Fonts.bold,
          fontSize: 32,
          color: color ?? colors.textPrimary,
          letterSpacing: -1,
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
