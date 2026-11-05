import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { authApi, colors } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { BackButton, Button, Field, Lbl, PasswordField, Screen, Spacer, Title } from '@/components/ui';
import { useSession } from '@/lib/session';

/** 4. About you (step 1 of 4) */
export default function Details() {
  const { draft, updateDraft } = useSession();
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const pwOk = draft.password.length >= 8;
  const pwMatch = draft.password.length > 0 && draft.password === pw2;
  const canContinue = !!draft.fullName.trim() && pwOk && pwMatch;

  const submit = async () => {
    setBusy(true);
    try {
      await authApi.signUp({ fullName: draft.fullName.trim(), contact: draft.contact.trim(), dateOfBirth: draft.dateOfBirth, password: draft.password });
      router.push('/onboarding/verify');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padH={28} gap={0}>
      <BackButton />
      <Lbl style={{ marginTop: 8 }}>Step 1 of 4</Lbl>
      <Title size={30} style={{ marginTop: 8, marginBottom: 10 }}>
        Tell us about you
      </Title>
      <Text style={{ marginBottom: 22, fontSize: 15, lineHeight: 22, color: colors.muted }}>
        Your real name stays between you and Tedoku. Doctors never see it unless you choose to reveal it.
      </Text>
      <View style={{ gap: 16 }}>
        <Field label="Full name" autoComplete="name" textContentType="name" placeholder="Your real name" value={draft.fullName} onChangeText={(v) => updateDraft({ fullName: v })} />
        <Field label="Email or phone number" placeholder="To secure your account" autoCapitalize="none" value={draft.contact} onChangeText={(v) => updateDraft({ contact: v })} />
        {/* PLACEHOLDER: swap for a native date picker (@react-native-community/datetimepicker). */}
        <Field label="Date of birth" placeholder="DD / MM / YYYY" keyboardType="numbers-and-punctuation" value={draft.dateOfBirth} onChangeText={(v) => updateDraft({ dateOfBirth: v })} />
        <View>
          <PasswordField label="Create a password" newPassword placeholder="At least 8 characters" value={draft.password} onChangeText={(v) => updateDraft({ password: v })} />
          <Text style={{ fontSize: 12, marginTop: 6, color: pwOk ? colors.success : colors.muted }}>
            {pwOk ? 'Strong enough.' : 'Use 8 or more characters. You will sign in with this and your email or phone number.'}
          </Text>
        </View>
        <View>
          <PasswordField label="Confirm password" newPassword placeholder="Type it again" value={pw2} onChangeText={setPw2} />
          {pw2.length > 0 && !pwMatch && (
            <Text accessibilityRole="alert" style={{ fontSize: 12, marginTop: 6, color: colors.danger, fontWeight: '600' }}>
              The passwords do not match.
            </Text>
          )}
        </View>
      </View>
      <Text style={{ fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 14 }}>
        You must be 16 or older to use Tedoku. Your date of birth is only used to check this and to tailor health content.
      </Text>
      <Spacer min={20} />
      <Button label="Continue" disabled={!canContinue} loading={busy} onPress={submit} />
    </Screen>
  );
}
