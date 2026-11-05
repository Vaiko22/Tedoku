import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { authApi, colors } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { BackButton, Button, CodeInput, DemoHint, Lbl, Screen, Spacer, TextLink, Title } from '@/components/ui';
import { useSession } from '@/lib/session';

/** 5. Verify account (step 2 of 4) */
export default function Verify() {
  const { draft, setSession } = useSession();
  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  const shown = draft.contact.trim() || 'your email or phone number';

  const submit = async () => {
    setBusy(true);
    try {
      const res = await authApi.verifyCode(draft.contact, code);
      if (res.status === 'ok') {
        setSession(res.session);
        router.push('/onboarding/alias');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padH={28} gap={0}>
      <BackButton />
      <Lbl style={{ marginTop: 8 }}>Step 2 of 4</Lbl>
      <Title size={30} style={{ marginTop: 8, marginBottom: 10 }}>
        Verify your account
      </Title>
      <Text style={{ marginBottom: 24, fontSize: 15, lineHeight: 22, color: colors.muted }}>
        We sent a 6-digit code to <Text style={{ color: colors.ink, fontWeight: '700' }}>{shown}</Text>. Enter it to keep your account secure.
      </Text>
      <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 6 }}>Verification code</Text>
      <CodeInput label="Verification code" value={code} onChange={setCode} />
      <View style={{ marginTop: 10 }}>
        <DemoHint>For this mockup, any 6 digits will work.</DemoHint>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
        <Text style={{ color: colors.muted }}>Did not get it?</Text>
        <TextLink
          label={resent ? 'Code sent again' : 'Resend code'}
          onPress={() => {
            void authApi.resendCode(draft.contact);
            setResent(true);
          }}
        />
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '700', color: colors.muted, textDecorationLine: 'underline' }}>Wrong details? Go back and edit</Text>
      </Pressable>
      <Spacer min={20} />
      <Button label="Verify and continue" disabled={code.length < 6} loading={busy} onPress={submit} />
    </Screen>
  );
}
