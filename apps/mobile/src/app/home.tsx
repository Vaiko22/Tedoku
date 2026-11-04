import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { colors, patientApi, type Flow, type SleepQuality } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { Ring } from '@/components/Ring';
import { TabBar } from '@/components/TabBar';
import { Avatar, Card, Chip, Lbl, Loading, Screen, SmallButton, TextLink, VerifiedBadge } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useSession } from '@/lib/session';

const WATER = [
  ['Glass', 250],
  ['Bottle', 500],
  ['Large', 750],
] as const;

/** 8. Home */
export default function Home() {
  const { draft } = useSession();
  const home = useQuery(() => patientApi.home());
  const me = useQuery(() => patientApi.me());
  const [water, setWater] = useState(0);
  const [lastAdd, setLastAdd] = useState(0);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [flowOpen, setFlowOpen] = useState(false);
  const [sleepQ, setSleepQ] = useState<SleepQuality>('Restful');

  useEffect(() => {
    if (!home.data) return;
    setWater(home.data.water.consumedMl);
    setFlow(home.data.cycle.loggedFlow);
    setSleepQ(home.data.sleep.quality);
  }, [home.data]);

  if (!home.data) return <Loading />;
  const { cycle, water: w, sleep, featuredDoctors } = home.data;
  const alias = draft.alias || me.data?.alias || '';
  const name = draft.fullName.trim() || me.data?.fullName || 'friend';
  const goal = w.goalMl;
  const pct = Math.min(1, water / goal);
  const waterMsg = pct >= 1 ? 'Goal reached. Well done.' : pct < 0.25 ? 'Time for a glass of water.' : pct >= 0.6 ? 'Nearly there.' : 'A good start. Keep sipping.';
  const known = cycle.day !== null;
  const nextTxt = cycle.nextPeriodDate ? new Date(cycle.nextPeriodDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

  const addWater = (ml: number) => {
    setWater(Math.min(goal + 1500, water + ml));
    setLastAdd(ml);
    void patientApi.logWater(ml);
  };
  const undo = () => {
    setWater(Math.max(0, water - lastAdd));
    if (lastAdd) void patientApi.logWater(-lastAdd);
    setLastAdd(0);
  };
  const pickFlow = (f: Flow) => {
    setFlow(f);
    setFlowOpen(false);
    if (home.data?.cycle) void patientApi.updateCycleDay(new Date().toISOString().slice(0, 10), { period: true, flow: f });
  };
  const pickSleep = (q: SleepQuality) => {
    setSleepQ(q);
    void patientApi.logSleepQuality(q);
  };
  const h = Math.floor(sleep.lastNightMinutes / 60);
  const m = sleep.lastNightMinutes % 60;

  return (
    <Screen footer={<TabBar active="Home" />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: colors.muted }}>Hello,</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>{name}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12, borderRadius: 17, backgroundColor: colors.primarySoft }}>
          <Icon name="lock" size={14} color={colors.primary} strokeWidth={2} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>Private</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.primarySoft }}>
        <Icon name="lock" size={18} color={colors.primaryDeep} strokeWidth={1.9} />
        <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, color: colors.primaryDeep }}>
          In doctor chats you appear as <B>{alias}</B>. Your name stays private.
        </Text>
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.navigate('/learn')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border }}
      >
        <Icon name="search" color={colors.muted} />
        <Text style={{ color: colors.muted, fontSize: 15 }}>Ask anything. Anonymous by default.</Text>
      </Pressable>

      {/* Cycle */}
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Ring progress={known ? cycle.day! / cycle.lengthDays : 0} color={colors.cycle} track={colors.cycleSoft}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted }}>DAY</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', lineHeight: 28 }}>{known ? cycle.day : '?'}</Text>
          </Ring>
          <View style={{ flex: 1 }}>
            <Lbl color={colors.cycle}>Cycle</Lbl>
            <Text style={{ fontSize: 18, fontWeight: '800', lineHeight: 22, marginVertical: 4 }}>
              {known ? `Next period in about ${cycle.lengthDays - cycle.day!} days` : 'Learning your cycle'}
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 18, color: colors.muted }}>
              {known ? `Around ${nextTxt}, give or take 2 days.` : 'Log a few cycles and your predictions will sharpen.'}
            </Text>
          </View>
        </View>
        {flowOpen && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600' }}>How heavy is your flow today?</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['Light', 'Medium', 'Heavy'] as Flow[]).map((f) => (
                <Chip key={f} label={f} on={flow === f} onPress={() => pickFlow(f)} color={colors.cycle} flex height={44} idleBorder={colors.border} />
              ))}
            </View>
          </View>
        )}
        <SmallButton
          label={flow ? `Logged: ${flow.toLowerCase()}. Edit` : 'Log period or symptoms'}
          bg={colors.cycle}
          fg="#fff"
          height={48}
          style={{ borderRadius: 14 }}
          onPress={() => setFlowOpen(!flowOpen)}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>Estimate, not medical advice.</Text>
          <TextLink label="Open calendar" size={13} color={colors.cycle} onPress={() => router.push('/cycle')} />
        </View>
      </Card>

      {/* Hydration */}
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Ring progress={pct} color={colors.water} track={colors.waterSoft}>
            <Text style={{ fontSize: 22, fontWeight: '800', lineHeight: 24 }}>{(water / 1000).toFixed(1)}</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.muted }}>of {(goal / 1000).toFixed(1)} L</Text>
          </Ring>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <Lbl color={colors.water}>Hydration</Lbl>
            <Text style={{ fontSize: 18, fontWeight: '800', lineHeight: 22, marginVertical: 4 }}>{waterMsg}</Text>
            <Text accessibilityRole="button" onPress={undo} style={{ fontSize: 13, fontWeight: '600', color: colors.muted, textDecorationLine: 'underline' }}>
              Undo last
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {WATER.map(([label, ml]) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={`Add ${label}, ${ml} millilitres`}
              onPress={() => addWater(ml)}
              style={{ flex: 1, height: 54, borderRadius: 16, backgroundColor: colors.waterMist, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.waterDeep }}>{label}</Text>
              <Text style={{ fontSize: 12, fontWeight: '500', color: colors.waterDeep }}>+{ml} ml</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Sleep */}
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Lbl color={colors.sleep}>Sleep</Lbl>
            <Text style={{ fontSize: 26, fontWeight: '800', marginTop: 4 }}>
              {h}h {m}m <Text style={{ fontSize: 14, fontWeight: '600', color: colors.muted }}>last night</Text>
            </Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.sleepSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="moon" size={24} color={colors.sleep} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '600' }}>How did you rest?</Text>
          <TextLink label="Sleep details" size={13} color={colors.sleep} onPress={() => router.push('/sleep')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Restful', 'Okay', 'Poor'] as SleepQuality[]).map((q) => (
            <Chip key={q} label={q} on={sleepQ === q} onPress={() => pickSleep(q)} color={colors.sleep} flex height={44} idleBorder={colors.border} />
          ))}
        </View>
      </Card>

      {/* Doctors */}
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 17, fontWeight: '800' }}>Talk to a verified doctor</Text>
          <TextLink label="See all" size={13} onPress={() => router.navigate('/doctors')} />
        </View>
        {featuredDoctors.map((d) => (
          <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar initials={d.initials} tint={d.tint} size={46} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, fontWeight: '700' }}>{d.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>{d.specialty}</Text>
                <VerifiedBadge />
              </View>
            </View>
            <SmallButton label="Chat" height={38} onPress={() => router.push({ pathname: '/doctor/[id]', params: { id: d.id } })} style={{ paddingHorizontal: 16, backgroundColor: colors.primarySoft }} fg={colors.primary} />
          </View>
        ))}
        <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 17 }}>
          You will appear as <B>{alias}</B>. Pay in naira or USDC.
        </Text>
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/learn', params: { start: 'urgent' } })}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.dangerSoft }}
      >
        <Icon name="info" size={22} color={colors.dangerDeep} strokeWidth={1.9} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.dangerDeep }}>Need urgent help?</Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.dangerDeep }}>Emergency and support lines, always free.</Text>
        </View>
      </Pressable>
    </Screen>
  );
}
