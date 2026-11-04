import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { authApi, colors } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { Icon, type IconName } from '@/components/Icon';
import { BackButton, Screen, Spacer, Title } from '@/components/ui';
import { useSession } from '@/lib/session';

const OPTIONS: [IconName, string, 'google' | 'phone' | 'email'][] = [
  ['user', 'Continue with Google', 'google'],
  ['phone', 'Continue with phone number', 'phone'],
  ['mail', 'Continue with email', 'email'],
];

/** 3. Create your private space */
export default function Signup() {
  const { setSession } = useSession();

  const choose = async (method: (typeof OPTIONS)[number][2]) => {
    if (method === 'google') {
      // PLACEHOLDER: wire up Google sign-in (expo-auth-session) and send its token to authApi.
      const res = await authApi.signInWithGoogle();
      if (res.status === 'ok') setSession(res.session);
    }
    router.push('/onboarding/details');
  };

  return (
    <Screen padH={28} gap={0}>
      <BackButton />
      <Title size={30} style={{ marginTop: 20, marginBottom: 10 }}>
        Create your private space
      </Title>
      <Text style={{ marginBottom: 28, fontSize: 16, lineHeight: 24, color: colors.muted }}>
        Sign in once. We set up a secure private ID for you, so there is nothing technical to manage.
      </Text>
      <View style={{ gap: 12 }}>
        {OPTIONS.map(([icon, label, method]) => (
          <Pressable
            key={method}
            accessibilityRole="button"
            onPress={() => choose(method)}
            style={{ height: 56, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 }}
          >
            <Icon name={icon} size={22} />
            <Text style={{ fontWeight: '600', fontSize: 15 }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Spacer min={24} />
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <Icon name="lock" size={18} color={colors.muted} />
        <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: colors.muted }}>
          We only use your sign-in to protect your account. It is never shown to doctors or hospitals.
        </Text>
      </View>
    </Screen>
  );
}
