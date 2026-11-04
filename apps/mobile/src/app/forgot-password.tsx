import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authApi, colors, isEmail, isPhone } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Alert, BackButton, Button, CodeInput, DemoHint, Field, PasswordField, Screen, Segmented, Spacer, StateIcon, Sub, Title } from '@/components/ui';

type Step = 'request' | 'code' | 'newpw' | 'done';

/** Forgot password, for patients and doctors (`?role=provider`). */
export default function ForgotPassword() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const doctor = role === 'provider';
  const signInHref = doctor ? '/doctor-login' : '/login';
  const [step, setStep] = useState<Step>('request');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [resent, setResent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = method === 'email' ? isEmail(contact) : isPhone(contact);
  const ok = pw.length >= 8;
  const match = pw.length > 0 && pw === pw2;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };
  const sendCode = () =>
    run(async () => {
      await authApi.forgotPassword(contact.trim(), doctor ? 'provider' : 'patient');
      setCode('');
      setCodeError(false);
      setStep('code');
    });
  const checkCode = () =>
    run(async () => {
      const res = await authApi.checkResetCode(contact.trim(), code);
      if (res.valid && res.resetToken) {
        setResetToken(res.resetToken);
        setStep('newpw');
      } else setCodeError(true);
    });
  const save = () =>
    run(async () => {
      await authApi.resetPassword(resetToken, pw);
      setStep('done');
    });

  const back = () => (step === 'request' || step === 'done' ? router.replace(signInHref) : setStep(step === 'newpw' ? 'code' : 'request'));

  return (
    <Screen padH={24} gap={16}>
      <BackButton label="Back to sign in" onPress={back} />

      {step === 'request' && (
        <>
          <View>
            <Title size={30}>Forgot your password?</Title>
            <Sub style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }}>
              {doctor
                ? 'Enter the email you used for your provider account. We will send a 6 digit code to reset it.'
                : 'Enter the email or phone number on your account. We will send a 6 digit code to reset it.'}
            </Sub>
          </View>
          {!doctor && (
            <Segmented
              value={method}
              onChange={(m) => (setMethod(m), setContact(''))}
              options={[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone number' },
              ]}
            />
          )}
          <Field
            label={method === 'email' ? (doctor ? 'Provider email' : 'Email address') : 'Phone number'}
            placeholder={method === 'email' ? (doctor ? 'you@hospital.ng' : 'you@example.com') : '0803 000 0000'}
            keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            value={contact}
            onChangeText={setContact}
          />
          <Button label="Send reset code" disabled={!valid} loading={busy} onPress={sendCode} />
          <Alert tone="info">For your safety we show the same message whether or not an account exists, so nobody can use this screen to find out who has one.</Alert>
          <Spacer />
          <Button variant="ghost" label="Back to sign in" onPress={() => router.replace(signInHref)} />
        </>
      )}

      {step === 'code' && (
        <>
          <View>
            <Title size={30}>Enter the code</Title>
            <Sub style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }}>
              If there is a {doctor ? 'provider' : 'Tedoku'} account for <Text style={{ color: colors.ink, fontWeight: '700' }}>{contact.trim()}</Text>, we sent a 6 digit code. It expires in 10 minutes.
            </Sub>
          </View>
          <CodeInput value={code} onChange={(v) => (setCode(v), setCodeError(false))} />
          {codeError && (
            <Alert tone="danger" bordered role="alert">
              <B>That code is not right or has expired.</B> Check the message and try again, or ask for a new code.
            </Alert>
          )}
          <Button label="Continue" disabled={code.length < 6} loading={busy} onPress={checkCode} />
          <Button
            variant="ghost"
            label={resent ? 'New code sent' : 'Send a new code'}
            onPress={() => {
              void authApi.forgotPassword(contact.trim(), doctor ? 'provider' : 'patient');
              setResent(true);
            }}
          />
          <Button variant="ghost" label={`Use a different ${doctor || method === 'email' ? 'email' : 'number'}`} onPress={() => setStep('request')} />
          <DemoHint>Demo: any 6 digits work. 000000 shows the error.</DemoHint>
        </>
      )}

      {step === 'newpw' && (
        <>
          <View>
            <Title size={30}>Choose a new password</Title>
            <Sub style={{ fontSize: 15, lineHeight: 22, marginTop: 8 }}>Pick something you have not used before. You will use it to sign in.</Sub>
          </View>
          <View>
            <PasswordField label="New password" newPassword placeholder="At least 8 characters" value={pw} onChangeText={setPw} />
            <Text style={{ fontSize: 12, marginTop: 6, color: ok ? colors.success : colors.muted }}>{ok ? 'Strong enough.' : 'Use 8 or more characters.'}</Text>
          </View>
          <View>
            <PasswordField label="Confirm new password" newPassword placeholder="Type it again" value={pw2} onChangeText={setPw2} />
            {pw2.length > 0 && !match && (
              <Text accessibilityRole="alert" style={{ fontSize: 12, marginTop: 6, color: colors.danger, fontWeight: '600' }}>
                The passwords do not match.
              </Text>
            )}
          </View>
          <Alert tone="info">Saving a new password signs you out everywhere else, so anyone who had your old one is locked out.</Alert>
          <Spacer />
          <Button label="Save new password" disabled={!(ok && match)} loading={busy} onPress={save} />
        </>
      )}

      {step === 'done' && (
        <View style={{ flex: 1, alignItems: 'center', gap: 16, paddingTop: 50 }}>
          <StateIcon name="check" bg={colors.successSoft} color={colors.success} />
          <Title>Password updated</Title>
          <Sub style={{ fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 300 }}>
            {doctor
              ? 'You can now sign in to your provider account with your new password. Your patients and escrow are untouched.'
              : 'You can now sign in with your new password. Your private ID and health logs are exactly as you left them.'}
          </Sub>
          <Spacer />
          <Button label="Sign in" style={{ alignSelf: 'stretch' }} onPress={() => router.replace(signInHref)} />
        </View>
      )}
    </Screen>
  );
}
