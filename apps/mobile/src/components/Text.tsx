import { createContext, useContext } from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { colors } from '@tedoku/shared';

/**
 * Plus Jakarta Sans ships one font file per weight, so on native a `fontWeight`
 * has to become a `fontFamily`. These wrappers do that, so screens can keep
 * writing `fontWeight: '800'` exactly like the design.
 */
const FAMILY: Record<string, string> = {
  '400': 'PlusJakartaSans_400Regular',
  normal: 'PlusJakartaSans_400Regular',
  '500': 'PlusJakartaSans_500Medium',
  '600': 'PlusJakartaSans_600SemiBold',
  '700': 'PlusJakartaSans_700Bold',
  bold: 'PlusJakartaSans_700Bold',
  '800': 'PlusJakartaSans_800ExtraBold',
};

export const fontFor = (weight?: TextStyle['fontWeight']) => ({ fontFamily: FAMILY[String(weight ?? '400')] ?? FAMILY['400'] });

const Nested = createContext(false);

export function Text({ style, children, ...rest }: TextProps) {
  const nested = useContext(Nested);
  const { fontWeight, ...flat } = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  // Nested text inherits size and colour from its parent, like <b> inside <p>.
  const base = nested ? null : styles.base;
  const font = nested && !fontWeight ? null : fontFor(fontWeight);
  return (
    <RNText {...rest} style={[base, flat, font]}>
      <Nested.Provider value>{children}</Nested.Provider>
    </RNText>
  );
}

/** Bold inline text that keeps the parent's colour and size. */
export function B({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[{ fontWeight: '700' }, style]} />;
}

export function TextInput({ style, ...rest }: TextInputProps) {
  const { fontWeight, ...flat } = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  return <RNTextInput placeholderTextColor="#8C8698" {...rest} style={[styles.input, flat, fontFor(fontWeight)]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.ink, fontSize: 14 },
  input: { color: colors.ink, fontSize: 16 },
});
