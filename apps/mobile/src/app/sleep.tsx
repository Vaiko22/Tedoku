import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, patientApi, type SleepQuality } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { TabBar } from '@/components/TabBar';
import { BackButton, Card, Chip, Field, Lbl, Loading, Screen, SmallButton, Sub, TextLink, Title } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const PX = 15; // px per hour in the chart

/** 11. Sleep tracker */
export default function Sleep() {
  const q = useQuery(() => patientApi.sleep());
  const [bed, setBed] = useState('23:00');
  const [wake, setWake] = useState('06:30');
  const [quality, setQuality] = useState<SleepQuality>('Restful');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (q.data) {
      setBed(q.data.lastNight.bed);
      setWake(q.data.lastNight.wake);
      setQuality(q.data.lastNight.quality);
    }
  }, [q.data]);

  if (!q.data) return <Loading />;
  const goal = q.data.goalHours;
  const hrs = (((toMin(wake) - toMin(bed)) % 1440) + 1440) % 1440 / 60;
  const week = q.data.week.map((d, i, all) => (i === all.length - 1 && saved ? { ...d, hours: hrs } : d));
  const got = week.map((d) => d.hours).filter((v): v is number => v !== null);
  const avg = got.reduce((a, b) => a + b, 0) / Math.max(1, got.length);
  const gap = goal - avg;

  const save = async () => {
    await patientApi.logSleep(bed, wake, quality);
    setSaved(true);
  };

  return (
    <Screen footer={<TabBar active="Home" />}>
      <BackButton label="Back to home" onPress={() => router.navigate('/home')} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Title>Sleep</Title>
          <Text style={{ marginTop: 4, color: colors.muted }}>
            Your goal: <Text style={{ color: colors.ink, fontWeight: '700' }}>{goal} hours</Text> a night
          </Text>
        </View>
        <TextLink label="Change goal" color={colors.sleep} onPress={() => router.push('/sleep-setup')} style={{ paddingBottom: 4 }} />
      </View>

      <Card style={{ gap: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '800' }}>Last night</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* PLACEHOLDER: swap for a native time picker (@react-native-community/datetimepicker). */}
          <View style={{ flex: 1 }}>
            <Lbl style={{ marginBottom: 6 }}>Went to bed</Lbl>
            <Field accessibilityLabel="Went to bed" value={bed} onChangeText={(v) => (setBed(v), setSaved(false))} placeholder="23:00" keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Lbl style={{ marginBottom: 6 }}>Woke up</Lbl>
            <Field accessibilityLabel="Woke up" value={wake} onChangeText={(v) => (setWake(v), setSaved(false))} placeholder="06:30" keyboardType="numbers-and-punctuation" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontSize: 36, fontWeight: '800', letterSpacing: -0.6, color: colors.sleep }}>{hrs.toFixed(1)}</Text>
          <Text style={{ color: colors.muted }}>hours of sleep</Text>
        </View>
        <Lbl>How did you rest?</Lbl>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Restful', 'Okay', 'Poor'] as SleepQuality[]).map((l) => (
            <Chip key={l} label={l} flex color={colors.sleep} on={quality === l} onPress={() => setQuality(l)} />
          ))}
        </View>
        <SmallButton label={saved ? 'Saved for today' : 'Save last night'} onPress={save} bg={colors.sleep} fg="#fff" height={48} style={{ borderRadius: 14 }} />
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '800' }}>Last 7 days</Text>
          <Sub style={{ fontSize: 12 }}>Dashed line is your goal</Sub>
        </View>
        <View
          accessibilityRole="image"
          accessibilityLabel={'Sleep last 7 days: ' + week.map((d) => `${d.day} ${d.hours === null ? 'not logged' : d.hours.toFixed(1) + ' hours'}`).join(', ')}
          style={{ height: 190, marginTop: 6 }}
        >
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: goal * PX, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.sleep, opacity: 0.6 }} />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            {week.map((d) => (
              <View key={d.day} style={{ width: 34, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', marginBottom: 4, color: colors.inkSoft }}>{d.hours === null ? '–' : d.hours.toFixed(1)}</Text>
                <View
                  style={{
                    width: 28,
                    height: d.hours === null ? 4 : d.hours * PX,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    backgroundColor: d.hours === null ? colors.border : d.hours >= goal ? colors.sleep : colors.sleepLight,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
          {week.map((d) => (
            <Text key={d.day} style={{ width: 34, textAlign: 'center', fontSize: 11, fontWeight: '600', color: colors.muted }}>
              {d.day}
            </Text>
          ))}
        </View>
      </Card>

      <Card style={{ gap: 6 }}>
        <Lbl>7-day average</Lbl>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.sleep }}>{avg.toFixed(1)} hours</Text>
        <Text style={{ lineHeight: 21, color: colors.inkSoft }}>
          {gap <= 0 ? 'You are meeting your goal. Lovely.' : `That is about ${gap.toFixed(1)} hours below your goal. No pressure, just a gentle nudge.`}
        </Text>
      </Card>
      <View style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.sleepSoft }}>
        <Text style={{ lineHeight: 21, color: colors.sleepDeep }}>
          <B>A small step:</B> try going to bed 15 minutes earlier this week. Small changes add up.
        </Text>
      </View>
    </Screen>
  );
}
