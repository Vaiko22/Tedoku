import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, patientApi, type OnboardingSetup } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { Button, Card, Chip, ChipGroup, Lbl, Screen, Spacer, Stepper, Title } from '@/components/ui';

const LAST: [OnboardingSetup['lastPeriod'], string][] = [
  ['today', 'Today'],
  ['few', 'A few days ago'],
  ['week', 'Last week'],
  ['skip', 'Not sure'],
];

/** 7. Quick setup (step 4 of 4) */
export default function Setup() {
  const [len, setLen] = useState(28);
  const [last, setLast] = useState<OnboardingSetup['lastPeriod']>('few');
  const [goal, setGoal] = useState(2400);
  const [busy, setBusy] = useState(false);

  const finish = async (save: boolean) => {
    setBusy(true);
    try {
      if (save) await patientApi.saveSetup({ cycleLengthDays: len, lastPeriod: last, waterGoalMl: goal });
      router.replace('/home');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padH={28} padTop={14} gap={0}>
      <Lbl style={{ marginBottom: 8 }}>Step 4 of 4</Lbl>
      <Title size={30} style={{ marginBottom: 8 }}>
        Make it yours
      </Title>
      <Text style={{ marginBottom: 22, fontSize: 15, lineHeight: 22, color: colors.muted }}>All optional. You can change any of this later.</Text>
      <Card style={{ gap: 22 }}>
        <View>
          <Lbl style={{ marginBottom: 10 }}>Usual cycle length</Lbl>
          <Stepper value={String(len)} unit="days" downLabel="Shorter" upLabel="Longer" onDown={() => setLen(Math.max(21, len - 1))} onUp={() => setLen(Math.min(40, len + 1))} />
        </View>
        <View>
          <Lbl style={{ marginBottom: 10 }}>Last period started</Lbl>
          <ChipGroup>
            {LAST.map(([id, label]) => (
              <Chip key={id} label={label} on={last === id} onPress={() => setLast(id)} idleBorder={colors.border} />
            ))}
          </ChipGroup>
        </View>
        <View>
          <Lbl style={{ marginBottom: 10 }}>Daily water goal</Lbl>
          <Stepper
            value={(goal / 1000).toFixed(1)}
            unit="litres"
            downLabel="Less water"
            upLabel="More water"
            onDown={() => setGoal(Math.max(1000, goal - 100))}
            onUp={() => setGoal(Math.min(4000, goal + 100))}
          />
        </View>
      </Card>
      <Spacer min={20} />
      <Button label="Finish setup" loading={busy} onPress={() => finish(true)} />
      <Button variant="ghost" label="Skip for now" onPress={() => finish(false)} />
    </Screen>
  );
}
