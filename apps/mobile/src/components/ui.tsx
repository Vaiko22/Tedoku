import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, isUsingMocks } from '@tedoku/shared';
import { Text, TextInput } from './Text';
import { Icon } from './Icon';

export const shadow: ViewStyle = {
  shadowColor: '#231B2E',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

// ------------------------------------------------------------------ layout

/**
 * A full screen. `footer` sits under the scroll area (tab bar, composer…).
 * Top padding follows the device's safe area, like the design's status-bar gap.
 */
export function Screen({
  children,
  footer,
  scroll = true,
  padH = 20,
  padTop = 6,
  gap = 14,
  bg = colors.bg,
  contentStyle,
  header,
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  padH?: number;
  padTop?: number;
  gap?: number;
  bg?: string;
  contentStyle?: StyleProp<ViewStyle>;
  header?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const inner: ViewStyle = { paddingTop: header ? 8 : insets.top + padTop, paddingHorizontal: padH, paddingBottom: 24, gap, flexGrow: 1 };
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {header && <View style={{ paddingTop: insets.top }}>{header}</View>}
      {scroll ? (
        <ScrollView contentContainerStyle={[inner, contentStyle]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[inner, { flex: 1 }, contentStyle]}>{children}</View>
      )}
      {footer}
    </View>
  );
}

export const Spacer = ({ min = 0 }: { min?: number }) => <View style={{ flexGrow: 1, minHeight: min }} />;

export function BackButton({ onPress, label = 'Back' }: { onPress?: () => void; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      hitSlop={6}
      style={{ width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name="back" size={24} strokeWidth={2} />
    </Pressable>
  );
}

export function Title({ children, size = 28, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontSize: size, fontWeight: '800', letterSpacing: -0.5, lineHeight: size * 1.15 }, style]}>{children}</Text>;
}

export function Sub({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontSize: 13, color: colors.muted, lineHeight: 19 }, style]}>{children}</Text>;
}

export function Lbl({ children, color = colors.muted, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontSize: 12, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', color }, style]}>{children}</Text>;
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return <View style={[{ backgroundColor: colors.surface, borderRadius: 22, padding: padded ? 16 : 0 }, shadow, style]}>{children}</View>;
}

/** A list row with a bottom divider, as in the design's `.row`. */
export function Row({ children, style, last, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; last?: boolean; onPress?: () => void }) {
  const s: StyleProp<ViewStyle> = [
    { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.divider },
    style,
  ];
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={s}>
      {children}
    </Pressable>
  ) : (
    <View style={s}>{children}</View>
  );
}

/** A label/value pair inside a card. */
export function KeyValue({ k, v, last, vStyle }: { k: string; v: ReactNode; last?: boolean; vStyle?: StyleProp<TextStyle> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 11, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.divider }}>
      <Text style={{ color: colors.muted }}>{k}</Text>
      {typeof v === 'string' ? <Text style={[{ fontWeight: '700' }, vStyle]}>{v}</Text> : v}
    </View>
  );
}

// ------------------------------------------------------------------ buttons

export function Button({
  label,
  onPress,
  disabled,
  bg = colors.primary,
  fg = '#fff',
  variant = 'solid',
  loading,
  style,
  height = 54,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  bg?: string;
  fg?: string;
  variant?: 'solid' | 'soft' | 'ghost';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  height?: number;
}) {
  const v =
    variant === 'soft'
      ? { bg: colors.primarySoft, fg: colors.primaryDeep, h: 48, r: 14, size: 15 }
      : variant === 'ghost'
        ? { bg: 'transparent', fg: colors.muted, h: 46, r: 14, size: 15 }
        : { bg, fg, h: height, r: 16, size: 16 };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        { height: v.h, borderRadius: v.r, backgroundColor: v.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={{ color: variant === 'solid' ? fg : v.fg, fontWeight: variant === 'ghost' ? '600' : '700', fontSize: v.size }}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Small pill-shaped button, e.g. "Copy address" or "Chat". */
export function SmallButton({
  label,
  onPress,
  bg = colors.primarySoft,
  fg = colors.primaryDeep,
  height = 44,
  style,
  disabled,
  borderColor,
}: {
  label: string;
  onPress?: () => void;
  bg?: string;
  fg?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  borderColor?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        { height, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        borderColor ? { borderWidth: 1.5, borderColor } : null,
        style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: height < 40 ? 12 : 14 }}>{label}</Text>
    </Pressable>
  );
}

export function TextLink({ label, onPress, color = colors.primary, size = 14, style }: { label: string; onPress: () => void; color?: string; size?: number; style?: StyleProp<TextStyle> }) {
  return (
    <Text accessibilityRole="link" onPress={onPress} style={[{ color, fontWeight: '700', fontSize: size }, style]}>
      {label}
    </Text>
  );
}

export function Chip({
  label,
  on,
  onPress,
  color = colors.primary,
  flex,
  height = 38,
  idleBorder = colors.borderStrong,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  color?: string;
  flex?: boolean;
  height?: number;
  idleBorder?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={{
        height,
        paddingHorizontal: 14,
        borderRadius: height / 2,
        backgroundColor: on ? color : '#fff',
        borderWidth: 1.5,
        borderColor: on ? color : idleBorder,
        alignItems: 'center',
        justifyContent: 'center',
        flex: flex ? 1 : undefined,
      }}
    >
      <Text style={{ color: on ? '#fff' : colors.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function ChipGroup({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>;
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: colors.segmented }} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{ flex: 1, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? '#fff' : 'transparent' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: on ? colors.primaryDeep : colors.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onChange, label, onColor = colors.primary, size = 'md' }: { value: boolean; onChange: (v: boolean) => void; label: string; onColor?: string; size?: 'md' | 'lg' }) {
  const w = size === 'lg' ? 56 : 48;
  const h = size === 'lg' ? 32 : 28;
  const k = size === 'lg' ? 26 : 22;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: value ? onColor : colors.borderStrong, justifyContent: 'center' }}
    >
      <View style={{ position: 'absolute', top: 3, left: value ? w - k - 3 : 3, width: k, height: k, borderRadius: k / 2, backgroundColor: '#fff' }} />
    </Pressable>
  );
}

export function Stepper({ value, unit, onDown, onUp, downLabel, upLabel, big }: { value: string; unit?: string; onDown: () => void; onUp: () => void; downLabel: string; upLabel: string; big?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <StepBtn label={downLabel} sign="−" onPress={onDown} />
      <Text style={{ fontSize: big ? 36 : 26, fontWeight: '800', letterSpacing: big ? -0.6 : 0 }} accessibilityLiveRegion="polite">
        {value}
        {unit ? <Text style={{ fontSize: big ? 16 : 15, fontWeight: '600', color: colors.muted }}> {unit}</Text> : null}
      </Text>
      <StepBtn label={upLabel} sign="+" onPress={onUp} />
    </View>
  );
}

export function StepBtn({ label, sign, onPress }: { label: string; sign: '+' | '−'; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryMist, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>{sign}</Text>
    </Pressable>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: checked ? colors.primary : colors.borderStrong,
          backgroundColor: checked ? colors.primary : '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
      </View>
      <View style={{ flex: 1 }}>{typeof label === 'string' ? <Text style={{ fontSize: 14, fontWeight: '600', lineHeight: 20 }}>{label}</Text> : label}</View>
    </Pressable>
  );
}

// ------------------------------------------------------------------ inputs

export const inputStyle: TextStyle = {
  height: 54,
  borderRadius: 14,
  borderWidth: 1.5,
  borderColor: colors.borderStrong,
  backgroundColor: '#fff',
  paddingHorizontal: 16,
  fontSize: 16,
};

export function Field({ label, style, ...props }: TextInputProps & { label?: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <View>
      {label && <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 6 }}>{label}</Text>}
      <TextInput
        accessibilityLabel={label ?? props.placeholder}
        {...props}
        onFocus={(e) => (setFocus(true), props.onFocus?.(e))}
        onBlur={(e) => (setFocus(false), props.onBlur?.(e))}
        style={[inputStyle, focus && { borderColor: colors.primary, borderWidth: 2 }, style]}
      />
    </View>
  );
}

export function PasswordField({ label, value, onChangeText, placeholder, newPassword }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; newPassword?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <View>
      <Field
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete={newPassword ? 'new-password' : 'current-password'}
        textContentType={newPassword ? 'newPassword' : 'password'}
        style={{ paddingRight: 76 }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show or hide password"
        onPress={() => setShow(!show)}
        style={{ position: 'absolute', right: 6, bottom: 7, height: 40, paddingHorizontal: 12, justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>{show ? 'Hide' : 'Show'}</Text>
      </Pressable>
    </View>
  );
}

export function CodeInput({ value, onChange, label = '6 digit code' }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <Field
      accessibilityLabel={label}
      value={value}
      onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 6))}
      keyboardType="number-pad"
      autoComplete="one-time-code"
      textContentType="oneTimeCode"
      maxLength={6}
      placeholder="000000"
      style={{ textAlign: 'center', fontSize: 30, fontWeight: '800', letterSpacing: 12, height: 68 }}
    />
  );
}

// ------------------------------------------------------------------ feedback

const TONE = {
  danger: { bg: colors.dangerSoft, fg: colors.dangerInk, border: colors.dangerBorder },
  warning: { bg: colors.warningSoft, fg: colors.warningInk, border: colors.warningBorder },
  info: { bg: colors.primarySoft, fg: colors.primaryDeep, border: undefined },
  success: { bg: colors.successSoft, fg: colors.successDeep, border: undefined },
  sleep: { bg: colors.sleepSoft, fg: colors.sleepDeep, border: undefined },
};

export function Alert({ tone, children, bordered, icon, role }: { tone: keyof typeof TONE; children: ReactNode; bordered?: boolean; icon?: React.ComponentProps<typeof Icon>['name']; role?: 'alert' }) {
  const t = TONE[tone];
  return (
    <View
      accessibilityRole={role}
      style={[
        { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: t.bg },
        bordered && t.border ? { borderWidth: 1.5, borderColor: t.border } : null,
      ]}
    >
      {icon && <Icon name={icon} size={18} color={t.fg} />}
      <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: t.fg }}>{children}</Text>
    </View>
  );
}

/** Lines like "Demo: any password works" only appear while the app runs on placeholder data. */
export function DemoHint({ children, onPress }: { children: string; onPress?: () => void }) {
  if (!isUsingMocks()) return null;
  return onPress ? (
    <Text accessibilityRole="button" onPress={onPress} style={{ fontSize: 12, color: colors.muted, textDecorationLine: 'underline', alignSelf: 'flex-start', paddingVertical: 4 }}>
      {children}
    </Text>
  ) : (
    <Sub style={{ textAlign: 'center', fontSize: 12 }}>{children}</Sub>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function Avatar({ initials, tint = colors.primarySoft, size = 46, color = colors.ink }: { initials: string; tint?: string; size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontWeight: '800', fontSize: Math.round(size / 3.2), color }}>{initials}</Text>
    </View>
  );
}

export function Tag({ label, bg = colors.successSoft, fg = colors.successDeep }: { label: string; bg?: string; fg?: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: fg }}>{label}</Text>
    </View>
  );
}

export function VerifiedBadge({ label = 'Verified', boxed }: { label?: string; boxed?: boolean }) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 4 },
        boxed ? { backgroundColor: colors.successSoft, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 9 } : null,
      ]}
    >
      <Icon name="shield" size={13} color={colors.success} strokeWidth={2.2} />
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>{label}</Text>
    </View>
  );
}

export function Mono({ children, size = 12 }: { children: string; size?: number }) {
  return (
    <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}>
      <Text selectable style={{ fontFamily: 'Menlo', fontSize: size, lineHeight: size * 1.5 }}>
        {children}
      </Text>
    </View>
  );
}

/** Round icon badge used on success / failure / empty states. */
export function StateIcon({ name, bg, color, size = 76, radius }: { name: React.ComponentProps<typeof Icon>['name']; bg: string; color: string; size?: number; radius?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
      <Icon name={name} size={size * 0.45} color={color} strokeWidth={2.2} />
    </View>
  );
}

// ------------------------------------------------------------------ sheet

/** Bottom sheet with a dimmed backdrop, as used for payment, reveal and rating. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(35,27,46,.45)' }]} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 28 + insets.bottom, gap: 12 }}>
        {children}
      </View>
    </Modal>
  );
}
