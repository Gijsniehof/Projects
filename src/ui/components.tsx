import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, space, type } from './theme';

export function Screen({
  children,
  footer,
  scroll = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { opacity: 0.75 },
        disabled && { opacity: 0.35 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: v.text }]}>{label}</Text>
    </Pressable>
  );
}

const buttonVariants: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: colors.accent, text: colors.accentText, border: colors.accent },
  secondary: { bg: colors.surface, text: colors.text, border: colors.border },
  ghost: { bg: 'transparent', text: colors.text, border: 'transparent' },
  danger: { bg: colors.imposter, text: '#FFFFFF', border: colors.imposter },
};

export function Section({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <View style={styles.section}>
      <Text style={type.label}>{label}</Text>
      {children}
      {hint ? <Text style={type.small}>{hint}</Text> : null}
    </View>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <View style={styles.stepper}>
      <StepButton label="−" disabled={value <= min} onPress={() => onChange(value - 1)} />
      <Text style={styles.stepperValue}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <StepButton label="+" disabled={value >= max} onPress={() => onChange(value + 1)} />
    </View>
  );
}

function StepButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'Meer' : 'Minder'}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.stepButton, pressed && { opacity: 0.6 }, disabled && { opacity: 0.3 }]}
    >
      <Text style={styles.stepButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.xl, gap: space.xl },
  footer: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.lg,
    gap: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  button: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  section: { gap: space.md },
  segmented: { flexDirection: 'row', backgroundColor: colors.soft, borderRadius: radius.md, padding: 3 },
  segment: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm + 2 },
  segmentActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: { fontSize: 15, fontWeight: '500', color: colors.muted },
  segmentTextActive: { color: colors.text, fontWeight: '600' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  stepButton: { width: 52, height: 48, alignItems: 'center', justifyContent: 'center' },
  stepButtonText: { fontSize: 24, color: colors.text },
  stepperValue: { minWidth: 56, textAlign: 'center', fontSize: 18, fontWeight: '600', color: colors.text },
  chip: {
    paddingHorizontal: 14,
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.text },
  chipTextActive: { color: colors.accentText },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.xl,
  },
});
