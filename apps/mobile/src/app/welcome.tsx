import { View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon, type IconName } from '@/components/Icon';
import { Button, Spacer, TextLink } from '@/components/ui';

const POINTS: [IconName, string, string][] = [
  ['lock', 'Private by design.', 'An alias, never your name.'],
  ['shield', 'Verified doctors only.', 'Every credential is checked.'],
  ['heart', 'Your data stays yours.', 'Never sold, never used for ads.'],
];

/** 2. Welcome */
export default function Welcome() {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={[colors.primaryWash, colors.bg]} locations={[0, 0.45]} style={{ flex: 1, paddingTop: insets.top + 28, paddingHorizontal: 28, paddingBottom: insets.bottom + 24 }}>
      <View style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="drop" size={30} color="#fff" />
      </View>
      <Text style={{ marginTop: 30, marginBottom: 12, fontSize: 36, lineHeight: 40, fontWeight: '800', letterSpacing: -0.7 }}>A safe space for your body.</Text>
      <Text style={{ marginBottom: 30, fontSize: 16, lineHeight: 24, color: colors.muted }}>
        Track your cycle, water and sleep. Ask anything. Talk to verified doctors without giving up your identity.
      </Text>
      <View style={{ gap: 16 }}>
        {POINTS.map(([icon, title, sub]) => (
          <View key={title} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryMist, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 15, lineHeight: 20, flex: 1 }}>
              <B>{title}</B>
              {'\n'}
              <Text style={{ color: colors.muted }}>{sub}</Text>
            </Text>
          </View>
        ))}
      </View>
      <Spacer min={20} />
      <Button label="Get started" onPress={() => router.push('/onboarding/signup')} />
      <Button variant="ghost" label="I already have an account" onPress={() => router.push('/login')} />
      <TextLink label="Are you a doctor? Join as a verified provider" onPress={() => router.push('/provider-apply')} style={{ textAlign: 'center', paddingTop: 8 }} />
    </LinearGradient>
  );
}
