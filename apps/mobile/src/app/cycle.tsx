import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { colors, patientApi, type CycleData, type Flow } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { TabBar } from '@/components/TabBar';
import { BackButton, Card, Chip, ChipGroup, Lbl, Loading, Screen, SmallButton, Sub, Title } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { router } from 'expo-router';

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
};
const add = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const SYMPTOMS = ['Cramps', 'Headache', 'Mood changes', 'Spotting', 'Discharge'];
const DOWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * 9. Cycle calendar. Predictions are computed on the device from logged days.
 * PLACEHOLDER: move the prediction maths to the backend if it should be shared.
 */
export default function Cycle() {
  const q = useQuery(() => patientApi.cycle());
  const [data, setData] = useState<CycleData | null>(null);
  const [month, setMonth] = useState(0);
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    if (q.data) {
      setData(q.data);
      setSel((s) => s ?? q.data!.today);
    }
  }, [q.data]);

  const model = useMemo(() => {
    if (!data) return null;
    const sorted = [...data.loggedDays].sort();
    const starts: string[] = [];
    sorted.forEach((s, i) => {
      if (i === 0 || (parse(s).getTime() - parse(sorted[i - 1]!).getTime()) / 86400000 > 1) starts.push(s);
    });
    const lens = starts.slice(1).map((s, i) => Math.round((parse(s).getTime() - parse(starts[i]!).getTime()) / 86400000));
    const avg = lens.length ? Math.round(lens.reduce((a, b) => a + b, 0) / lens.length) : 28;
    const last = starts.length ? parse(starts[starts.length - 1]!) : null;
    const next = last ? add(last, avg) : null;
    const pred = new Set<string>();
    const fert = new Set<string>();
    if (next) {
      for (let i = 0; i < 5; i++) pred.add(iso(add(next, i)));
      const ov = add(next, -14);
      for (let i = -5; i <= 1; i++) fert.add(iso(add(ov, i)));
    }
    return { starts, lens, avg, last, next, pred, fert, half: starts.length >= 3 ? 2 : 4 };
  }, [data]);

  if (!data || !model || !sel) return <Loading />;
  const today = parse(data.today);
  const base = new Date(today.getFullYear(), today.getMonth() + month, 1);
  const startCell = add(base, -((base.getDay() + 6) % 7));
  const selDate = parse(sel);
  const future = selDate > today;
  const isLogged = data.loggedDays.includes(sel);
  const myFlow = data.flow[sel] ?? null;
  const mySym = data.symptoms[sel] ?? [];
  const n = model.starts.length;

  const update = (patch: Partial<CycleData>, api: Parameters<typeof patientApi.updateCycleDay>[1]) => {
    setData({ ...data, ...patch });
    void patientApi.updateCycleDay(sel, api);
  };
  const toggle = () => {
    if (future) return;
    update({ loggedDays: isLogged ? data.loggedDays.filter((x) => x !== sel) : [...data.loggedDays, sel] }, { period: !isLogged });
  };

  return (
    <Screen footer={<TabBar active="Home" />}>
      <BackButton label="Back to home" onPress={() => router.navigate('/home')} />
      <View>
        <Title>Cycle</Title>
        <Text style={{ marginTop: 4, color: colors.muted }}>Tap a day to log your period.</Text>
      </View>

      <Card style={{ paddingVertical: 14, paddingHorizontal: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 10 }}>
          <MonthBtn label="Previous month" sign="‹" onPress={() => setMonth(Math.max(-6, month - 1))} />
          <Text style={{ fontSize: 17, fontWeight: '800' }}>{base.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text>
          <MonthBtn label="Next month" sign="›" onPress={() => setMonth(Math.min(3, month + 1))} />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          {DOWS.map((d) => (
            <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.muted }}>
              {d}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: 42 }, (_, i) => {
            const d = add(startCell, i);
            const k = iso(d);
            const L = data.loggedDays.includes(k);
            const P = !L && model.pred.has(k);
            const F = !L && !P && model.fert.has(k);
            const inMonth = d.getMonth() === base.getMonth();
            const ring = k === sel ? { borderColor: colors.primary, borderWidth: 3 } : k === data.today ? { borderColor: colors.ink, borderWidth: 2 } : null;
            return (
              <View key={k} style={{ width: `${100 / 7}%`, padding: 2 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) + (L ? ', period logged' : P ? ', predicted period' : F ? ', fertile window estimate' : '')}
                  onPress={() => setSel(k)}
                  style={{
                    height: 44,
                    borderRadius: F ? 10 : 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: inMonth ? 1 : 0.35,
                    backgroundColor: L ? colors.cycle : P ? colors.cycleSoft : F ? colors.waterSoft : 'transparent',
                    borderWidth: P ? 1.5 : 0,
                    borderStyle: P ? 'dashed' : 'solid',
                    borderColor: P ? colors.cycle : 'transparent',
                  }}
                >
                  {ring && <View style={[{ position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, borderRadius: F ? 12 : 24 }, ring]} />}
                  <Text style={{ fontSize: 14, fontWeight: L ? '800' : P ? '700' : F ? '600' : '500', color: L ? '#fff' : P ? colors.cycleDeep : F ? colors.waterDeep : colors.ink }}>{d.getDate()}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 10, marginTop: 12, paddingHorizontal: 4 }}>
          <Legend swatch={{ backgroundColor: colors.cycle, borderRadius: 7 }} label="Period" />
          <Legend swatch={{ backgroundColor: colors.cycleSoft, borderRadius: 7, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.cycle }} label="Predicted" />
          <Legend swatch={{ backgroundColor: colors.waterSoft, borderRadius: 4 }} label="Fertile window (estimate)" />
          <Legend swatch={{ borderRadius: 7, borderWidth: 2, borderColor: colors.ink }} label="Today" />
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '800' }}>{selDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <SmallButton
          label={isLogged ? 'Period day logged. Tap to remove' : 'Log as a period day'}
          onPress={toggle}
          disabled={future}
          height={48}
          bg={isLogged ? colors.cycle : '#fff'}
          fg={isLogged ? '#fff' : colors.cycleDeep}
          borderColor={colors.cycle}
          style={{ borderRadius: 14 }}
        />
        {isLogged && (
          <View style={{ gap: 10 }}>
            <Lbl>Flow</Lbl>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['Light', 'Medium', 'Heavy'] as Flow[]).map((f) => (
                <Chip key={f} label={f} flex color={colors.cycle} on={myFlow === f} onPress={() => update({ flow: { ...data.flow, [sel]: f } }, { flow: f })} />
              ))}
            </View>
            <Lbl>Symptoms</Lbl>
            <ChipGroup>
              {SYMPTOMS.map((s) => {
                const on = mySym.includes(s);
                const next = on ? mySym.filter((x) => x !== s) : [...mySym, s];
                return <Chip key={s} label={s} on={on} onPress={() => update({ symptoms: { ...data.symptoms, [sel]: next } }, { symptoms: next })} />;
              })}
            </ChipGroup>
          </View>
        )}
        {future && <Sub style={{ fontSize: 12 }}>You can only log days up to today.</Sub>}
      </Card>

      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Stat label="Last period started" value={model.last ? fmt(model.last) : 'Not logged yet'} />
        <Stat
          label="Average cycle"
          value={model.avg + ' days' + (model.lens.length ? `, from ${model.lens.length} ${model.lens.length === 1 ? 'cycle' : 'cycles'}` : ' (default until you log more)')}
        />
        <Stat label="Next period (estimate)" value={model.next ? `${fmt(add(model.next, -model.half))} to ${fmt(add(model.next, model.half))}` : 'Log a period to see this'} />
        <Stat label="Fertile window (estimate)" value={model.next ? `${fmt(add(model.next, -19))} to ${fmt(add(model.next, -13))}` : 'Log a period to see this'} last />
      </Card>

      <View style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.warningSoft }}>
        <Text style={{ fontSize: 13, lineHeight: 19, color: colors.warningInk }}>
          <B>{n >= 3 ? 'Your predictions are tuned to you.' : 'Learning your cycle.'}</B>{' '}
          {n >= 3
            ? `The range is narrower because you have logged ${n} cycles.`
            : `You have logged ${n} ${n === 1 ? 'cycle' : 'cycles'}, so the date range is wider. Predictions sharpen after 3 cycles.`}
        </Text>
      </View>
      <Sub style={{ textAlign: 'center', fontSize: 12 }}>Estimates only. Not medical advice, and not a way to prevent pregnancy.</Sub>
    </Screen>
  );
}

function MonthBtn({ label, sign, onPress }: { label: string; sign: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryMist, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary, lineHeight: 28 }}>{sign}</Text>
    </Pressable>
  );
}

function Legend({ swatch, label }: { swatch: object; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={[{ width: 14, height: 14 }, swatch]} />
      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.inkSoft }}>{label}</Text>
    </View>
  );
}

function Stat({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.divider }}>
      <Lbl>{label}</Lbl>
      <Text style={{ fontSize: 16, fontWeight: '800', marginTop: 2 }}>{value}</Text>
    </View>
  );
}
