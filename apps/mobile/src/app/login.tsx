import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { authApi, colors, isEmail, isPhone } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { Alert, BackButton, Button, DemoHint, Field, PasswordField, Screen, Segmented, Spacer, Sub, TextLink, Title } from '@/components/ui';
import { useSession } from '@/lib/session';

/** 1–3. Patient sign in: email or phone + password, wrong password, no account found. */
export default function Login() {
  const { setSession } = useSession();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const filled = (method === 'email' ? isEmail(contact) : isPhone(contact)) && pw.length > 0;

  const signIn = async () => {
    setBusy(true);
    try {
      const res = await authApi.signIn(contact.trim(), pw);
      if (res.status === 'ok') {
        setSession(res.session);
        router.replace('/home');
      } else if (res.status === 'not_found') setNotFound(true);
      else if (res.status === 'wrong_password') setError(res.attemptsLeft);
    } finally {
      setBusy(false);
    }
  };
  const google = async () => {
    // PLACEHOLDER: wire up Google sign-in (expo-auth-session).
    const res = await authApi.signInWithGoogle();
    if (res.status === 'ok') {
      setSession(res.session);
      router.replace('/home');
    }
  };

  if (notFound)
    return (
      <Screen padH={24} gap={16}>
        <BackButton onPress={() => setNotFound(false)} />
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="search" size={30} color={colors.primary} />
        </View>
        <View>
          <Title>We could not find an account</Title>
          <Sub style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }}>
            There is no Tedoku account for {contact.trim()}. Check for typos, try your other email or phone number, or create a new account.
          </Sub>
        </View>
        <Button label="Try again" onPress={() => setNotFound(false)} />
        <Button variant="soft" label="Create an account" onPress={() => router.replace('/onboarding/signup')} />
        <Alert tone="info">
          Your private ID and health logs are tied to your account. If you lost access to both your email and phone, contact support and we will help you recover it.
        </Alert>
      </Screen>
    );

  return (
    <Screen padH={24} gap={16}>
      <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />
      <View>
        <Title size={30}>Welcome back</Title>
        <Sub style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }}>Sign in with your email or phone number and your password.</Sub>
      </View>
      {error !== null && (
        <Alert tone="danger" bordered role="alert">
          <B>Email, phone or password is not right.</B> Check them and try again. You have {error} attempts left before we ask you to reset your password.
        </Alert>
      )}
      <Segmented
        value={method}
        onChange={(m) => {
          setMethod(m);
          setContact('');
          setError(null);
        }}
        options={[
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone number' },
        ]}
      />
      <Field
        label={method === 'email' ? 'Email address' : 'Phone number'}
        placeholder={method === 'email' ? 'you@example.com' : '0803 000 0000'}
        keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
        autoCapitalize="none"
        autoComplete={method === 'email' ? 'email' : 'tel'}
        value={contact}
        onChangeText={(v) => (setContact(v), setError(null))}
      />
      <PasswordField label="Password" placeholder="Your password" value={pw} onChangeText={(v) => (setPw(v), setError(null))} />
      <TextLink label="Forgot password?" onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-start' }} />
      <Button label="Sign in" disabled={!filled} loading={busy} onPress={signIn} />
      <DemoHint>Demo: any password works. "wrong" shows the error. An email starting with "new" shows no account found.</DemoHint>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Sub style={{ fontSize: 12 }}>or</Sub>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <Button label="Continue with Google" bg="#fff" fg={colors.ink} height={48} style={{ borderWidth: 1.5, borderColor: colors.border, borderRadius: 14 }} onPress={google} />
      <Spacer />
      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.muted }}>
        New to Tedoku?{' '}
        <Text accessibilityRole="link" style={{ color: colors.primary, fontWeight: '700' }} onPress={() => router.replace('/onboarding/signup')}>
          Create an account
        </Text>
      </Text>
      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.muted }}>
        Are you a doctor?{' '}
        <Text accessibilityRole="link" style={{ color: colors.primary, fontWeight: '700' }} onPress={() => router.push('/doctor-login')}>
          Provider sign in
        </Text>
      </Text>
    </Screen>
  );
}
