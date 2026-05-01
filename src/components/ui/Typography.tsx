import React from 'react';
import { Text, TextProps } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  color?: string;
}

export function H1({ children, style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[
        { fontFamily: Fonts.bold, fontSize: 28, color: color ?? Colors.textPrimary, letterSpacing: -0.5 },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function H2({ children, style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[
        { fontFamily: Fonts.semibold, fontSize: 22, color: color ?? Colors.textPrimary, letterSpacing: -0.3 },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function H3({ children, style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[
        { fontFamily: Fonts.semibold, fontSize: 17, color: color ?? Colors.textPrimary },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Body({ children, style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[
        { fontFamily: Fonts.regular, fontSize: 15, color: color ?? Colors.textPrimary, lineHeight: 22 },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function BodyMedium({ children, style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[
        { fontFamily: Fonts.medium, fontSize: 15, color: color ?? Colors.textPrimary },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[
        { fontFamily: Fonts.regular, fontSize: 12, color: color ?? Colors.textSecondary, lineHeight: 16 },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function AmountText({ children, style, color, ...props }: TypographyProps) {
  return (
    <Text
      style={[
        {
          fontFamily: Fonts.bold,
          fontSize: 32,
          color: color ?? Colors.textPrimary,
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
