import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, patientApi } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { TabBar } from '@/components/TabBar';
import { BackButton, Button, Card, Chip, Screen, Spacer, Stepper, Sub, Title } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

const clamp = (v: number) => Math.min(12, Math.max(3, v));

/** 10. Sleep setup */
export default function SleepSetup() {
  const q = useQuery(() => patientApi.sleep());
  const [usual, setUsual] = useState(6.5);
  const [goal, setGoal] = useState(8);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (q.data) {
      setUsual(q.data.usualHours);
      setGoal(q.data.goalHours);
    }
  }, [q.data]);

  const gap = Math.round((goal - usual) * 10) / 10;
  const meets = gap <= 0;

  const save = async () => {
    setBusy(true);
    try {
      await patientApi.saveSleepGoal(usual, goal);
      router.replace('/sleep');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padH={24} footer={<TabBar active="Home" />}>
      <BackButton label="Back to home" />
      <View>
        <Title>Let's set up your sleep</Title>
        <Text style={{ marginTop: 6, fontSize: 14, lineHeight: 21, color: colors.muted }}>Two quick questions. There are no wrong answers.</Text>
      </View>
      <Card style={{ gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '800' }}>How many hours do you usually sleep each night?</Text>
        <Stepper big value={usual.toFixed(1)} unit="hours" downLabel="Fewer hours" upLabel="More hours" onDown={() => setUsual(clamp(usual - 0.5))} onUp={() => setUsual(clamp(usual + 0.5))} />
      </Card>
      <Card style={{ gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '800' }}>How many hours would you like to sleep?</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[7, 8, 9].map((h) => (
            <Chip key={h} label={`${h} hours`} flex on={goal === h} onPress={() => setGoal(h)} />
          ))}
        </View>
        <Stepper big value={goal.toFixed(1)} unit="hours" downLabel="Lower goal" upLabel="Higher goal" onDown={() => setGoal(clamp(goal - 0.5))} onUp={() => setGoal(clamp(goal + 0.5))} />
        <Sub style={{ fontSize: 12 }}>Most adults feel their best with 7 to 9 hours. Your goal is yours to choose.</Sub>
      </Card>
      <View style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: meets ? colors.successSoft : colors.primarySoft }}>
        <Text style={{ fontSize: 14, lineHeight: 21, fontWeight: '600', color: meets ? colors.successDeep : colors.primaryDeep }}>
          {meets
            ? 'You already sleep as much as your goal. We will help you keep it up.'
            : `You sleep about ${gap.toFixed(1)} hours less than your goal. We will help you close the gap gently, one small step at a time.`}
        </Text>
      </View>
      <Spacer min={12} />
      <Button label="Save and start tracking" loading={busy} onPress={save} />
    </Screen>
  );
}
