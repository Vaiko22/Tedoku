import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { authApi, colors, providerApi, type ApplicationTimelineStep } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { Alert, BackButton, Button, Card, DemoHint, Field, PasswordField, Row, Screen, Spacer, Sub, TextLink, Title } from '@/components/ui';
import { useSession } from '@/lib/session';

/** 4–6. Provider sign in, wrong password, application in review. */
export default function DoctorLogin() {
  const { setSession } = useSession();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<number | null>(null);
  const [pending, setPending] = useState<ApplicationTimelineStep[] | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    try {
      const res = await authApi.providerSignIn(email.trim(), pw);
      if (res.status === 'ok') {
        setSession(res.session);
        router.replace('/provider');
      } else if (res.status === 'wrong_password') setError(res.attemptsLeft);
      else if (res.status === 'pending_review') setPending((await providerApi.applicationStatus()).timeline);
    } finally {
      setBusy(false);
    }
  };

  if (pending)
    return (
      <Screen padH={24} gap={16}>
        <BackButton onPress={() => setPending(null)} />
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="clock" size={30} color={colors.warningInk} />
        </View>
        <View>
          <Title>Your application is in review</Title>
          <Sub style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }}>We are checking your MDCN licence. This usually takes 1 to 2 working days. We will email you when it is done.</Sub>
        </View>
        <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
          {pending.map((t, i) => {
            const done = t.state === 'done';
            const cur = t.state === 'current';
            return (
              <Row key={t.label} last={i === pending.length - 1}>
                <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.successSoft : cur ? colors.warningSoft : colors.primaryMist }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: done ? colors.successDeep : cur ? colors.warningInk : colors.muted }}>{done ? '✓' : i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700' }}>{t.label}</Text>
                  <Sub style={{ fontSize: 12 }}>{t.note}</Sub>
                </View>
              </Row>
            );
          })}
        </Card>
        <Alert tone="info">You cannot take patients until you are approved. Your patients never see your application documents.</Alert>
        <Spacer />
        <DemoHint onPress={() => router.push({ pathname: '/provider-apply', params: { start: 'failed' } })}>Demo: see what a failed verification looks like</DemoHint>
        {/* PLACEHOLDER: in production this screen refreshes `providerApi.applicationStatus()` instead. */}
        <DemoHint onPress={() => router.replace('/provider')}>Demo: I have been approved</DemoHint>
        <Button variant="ghost" label="Sign out" onPress={() => (setPending(null), setPw(''))} />
      </Screen>
    );

  return (
    <Screen padH={24} gap={16}>
      <BackButton />
      <View>
        <View style={{ alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 10 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primaryDeep }}>Provider sign in</Text>
        </View>
        <Title size={30}>Welcome back, doctor</Title>
        <Sub style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }}>Sign in with the email and password from your application.</Sub>
      </View>
      {error !== null && (
        <Alert tone="danger" bordered role="alert">
          <B>Email or password is not right.</B> Check them and try again. You have {error} attempts left before we ask you to reset your password.
        </Alert>
      )}
      <Field label="Email address" placeholder="you@hospital.ng" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={email} onChangeText={(v) => (setEmail(v), setError(null))} />
      <PasswordField label="Password" placeholder="Your password" value={pw} onChangeText={(v) => (setPw(v), setError(null))} />
      <TextLink label="Forgot password?" onPress={() => router.push({ pathname: '/forgot-password', params: { role: 'provider' } })} style={{ alignSelf: 'flex-start' }} />
      <Button label="Sign in" disabled={!(email.trim().length > 2 && pw.length > 0)} loading={busy} onPress={signIn} />
      <DemoHint>Demo: any email works. A password of "wrong" shows the error. An email starting with "pending" shows the in review state.</DemoHint>
      <Spacer />
      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.muted }}>
        Not a provider yet?{' '}
        <Text accessibilityRole="link" style={{ color: colors.primary, fontWeight: '700' }} onPress={() => router.push('/provider-apply')}>
          Apply to join
        </Text>
      </Text>
      <Text style={{ textAlign: 'center', fontSize: 13, color: colors.muted }}>
        Looking for your health logs?{' '}
        <Text accessibilityRole="link" style={{ color: colors.primary, fontWeight: '700' }} onPress={() => router.replace('/login')}>
          Patient sign in
        </Text>
      </Text>
    </Screen>
  );
}
