import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, patientApi } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { BackButton, Button, Checkbox, Chip, ChipGroup, Field, Lbl, Screen, Spacer, Title } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useSession } from '@/lib/session';

const VALID = /^[A-Za-z0-9-]{4,20}$/;

/** 6. Choose private ID (step 3 of 4, permanent) */
export default function Alias() {
  const { draft, updateDraft } = useSession();
  const suggestions = useQuery(() => patientApi.aliasSuggestions());
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const alias = draft.alias;
  const valid = VALID.test(alias);

  const confirm = async () => {
    setBusy(true);
    try {
      await patientApi.confirmAlias(alias);
      router.push('/onboarding/setup');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[colors.primaryWash, colors.bg]} locations={[0, 0.4]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Screen padH={28} gap={0} bg="transparent">
        <BackButton />
        <Lbl style={{ marginTop: 8 }}>Step 3 of 4</Lbl>
        <Title size={30} style={{ marginTop: 8, marginBottom: 10 }}>
          Choose your private ID
        </Title>
        <Text style={{ marginBottom: 20, fontSize: 15, lineHeight: 22, color: colors.muted }}>
          Doctors and hospitals will see this instead of your name. Pick something that does not reveal who you are.
        </Text>
        <Field
          label="Your private ID"
          maxLength={20}
          autoCapitalize="none"
          autoCorrect={false}
          value={alias}
          onChangeText={(v) => updateDraft({ alias: v.replace(/[^A-Za-z0-9-]/g, '').slice(0, 20) })}
          style={{ fontSize: 20, fontWeight: '800', color: colors.primary }}
        />
        <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '600', color: valid ? colors.success : colors.dangerDeep }}>
          {valid ? 'Available' : 'Use 4 to 20 letters, numbers or hyphens.'}
        </Text>
        <Lbl style={{ marginTop: 16, marginBottom: 8 }}>Or try one of these</Lbl>
        <ChipGroup>
          {(suggestions.data ?? []).map((s) => (
            <Chip key={s} label={s} on={alias === s} onPress={() => updateDraft({ alias: s })} idleBorder={colors.border} />
          ))}
        </ChipGroup>
        <View style={{ marginTop: 18, flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.warningSoft }}>
          <Icon name="info" size={22} color={colors.warningInk} strokeWidth={1.9} />
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.warningInk }}>
            <B>This is permanent.</B> Once you confirm, you cannot change your private ID, so choose carefully.
          </Text>
        </View>
        <View style={{ marginTop: 14 }}>
          <Checkbox checked={understood} onChange={setUnderstood} label="I understand my private ID cannot be changed." />
        </View>
        <Spacer min={20} />
        <Button label="Confirm private ID" disabled={!(understood && valid)} loading={busy} onPress={confirm} />
      </Screen>
    </View>
  );
}
