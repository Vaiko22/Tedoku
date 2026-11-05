import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, consultationsApi, type ChatMessage, type RevealField } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { Bubble } from '@/components/Bubble';
import { Avatar, Button, Checkbox, Chip, Field, Lbl, Loading, Sheet, SmallButton, StateIcon, Sub } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

const FIELDS: [RevealField, string][] = [
  ['name', 'My real name'],
  ['phone', 'My phone number'],
  ['location', 'My location'],
  ['summary', 'My health summary (recent cycles)'],
];
const DURATIONS = ['24 hours', '7 days', 'Until I revoke'];
const POLL_MS = 3000;

/** Patient chat with a doctor, after payment. */
export default function PatientChat() {
  const { id, rail } = useLocalSearchParams<{ id: string; rail?: string }>();
  const insets = useSafeAreaInsets();
  const c = useQuery(() => consultationsApi.get(id), [id]);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sheet, setSheet] = useState<'none' | 'reveal' | 'done'>('none');
  const [fields, setFields] = useState<Record<RevealField, boolean>>({ name: true, phone: false, location: false, summary: false });
  const [duration, setDuration] = useState(DURATIONS[0]!);
  const [revealed, setRevealed] = useState(false);
  const [rating, setRating] = useState(0);
  const [released, setReleased] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (c.data) setMsgs(c.data.messages);
  }, [c.data]);

  // PLACEHOLDER: polling. Swap for a websocket or push when the backend supports it.
  useEffect(() => {
    const t = setInterval(() => void consultationsApi.messages(id).then(setMsgs).catch(() => {}), POLL_MS);
    return () => clearInterval(t);
  }, [id]);

  useEffect(() => {
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }, [msgs.length]);

  if (!c.data) return <Loading />;
  const d = c.data.doctor;
  const drFirst = d.name.split(' ').slice(0, 2).join(' ');
  const payRail = rail ?? c.data.rail;
  const ticked = FIELDS.filter(([k]) => fields[k]).map(([k]) => k);

  const send = async () => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    const m = await consultationsApi.send(id, t, 'patient');
    setMsgs((x) => [...x, m]);
  };
  const share = async () => {
    const m = await consultationsApi.reveal(id, ticked, duration);
    setMsgs((x) => [...x, m]);
    setRevealed(true);
    setSheet('none');
  };
  const release = async () => {
    await consultationsApi.complete(id, rating);
    setReleased(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.tabBorder, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to doctors" onPress={() => router.navigate('/doctors')} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={24} strokeWidth={2} />
        </Pressable>
        <Avatar initials={d.initials} tint={d.tint} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800' }}>{d.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="shield" size={13} color={colors.success} strokeWidth={2.2} />
            <Text style={{ fontSize: 12, color: colors.success, fontWeight: '700' }}>Verified {d.specialty.toLowerCase()}</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        <Banner bg={colors.primarySoft} fg={colors.primaryDeep} action="Reveal identity" actionBg="#fff" actionFg={colors.primary} onAction={() => setSheet('reveal')}>
          You are chatting as <B>{c.data.patientAlias}</B>. {revealed ? 'You have shared some details.' : 'Doctors never see your name unless you choose.'}
        </Banner>
        {!released && (
          <Banner bg={colors.successSoft} fg={colors.successDeep} action="Mark complete" actionBg={colors.success} actionFg="#fff" onAction={() => setSheet('done')}>
            <B>{payRail === 'usdc' ? 'Your USDC payment is' : `${c.data.amountLabel} is`}</B> held until you mark this chat complete.
          </Banner>
        )}
      </View>

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 10, flexGrow: 1 }}>
        {msgs.length === 0 && (
          <Text style={{ margin: 'auto', textAlign: 'center', color: colors.muted, maxWidth: 240, lineHeight: 21 }}>Complete payment to start chatting. Your name is never shown.</Text>
        )}
        {msgs.map((m) => (
          <Bubble key={m.id} m={m} mine="patient" />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingTop: 12, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.tabBorder }}>
        <View style={{ flex: 1 }}>
          <Field accessibilityLabel="Message" placeholder="Write a message" value={draft} onChangeText={setDraft} onSubmitEditing={send} returnKeyType="send" style={{ height: 46 }} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={send} style={{ width: 46, height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="send" color="#fff" />
        </Pressable>
      </View>
      <TabBar active="Doctors" />

      <Sheet visible={sheet === 'reveal'} onClose={() => setSheet('none')}>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>Reveal my identity</Text>
        <Text style={{ lineHeight: 20, color: colors.muted }}>Choose what {drFirst} can see. Nothing is shared unless you tick it.</Text>
        {FIELDS.map(([k, label]) => (
          <View key={k} style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border }}>
            <Checkbox checked={fields[k]} onChange={(v) => setFields({ ...fields, [k]: v })} label={label} />
          </View>
        ))}
        <Lbl>For how long</Lbl>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {DURATIONS.map((x) => (
            <Chip key={x} label={x} on={duration === x} onPress={() => setDuration(x)} />
          ))}
        </View>
        <Sub style={{ fontSize: 12 }}>You can revoke access any time. A consent receipt is recorded on-chain without your personal details.</Sub>
        <Button label="Share selected details" disabled={ticked.length === 0} onPress={share} />
      </Sheet>

      <Sheet visible={sheet === 'done'} onClose={() => setSheet('none')}>
        {!released ? (
          <>
            <Text style={{ fontSize: 20, fontWeight: '800' }}>How was your consultation?</Text>
            <Text style={{ lineHeight: 20, color: colors.muted }}>Your rating is anonymous and recorded on-chain. Marking this complete releases the payment to {drFirst}.</Text>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} out of 5`}
                  accessibilityState={{ selected: rating === n }}
                  onPress={() => setRating(n)}
                  style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: rating >= n ? colors.star : colors.primaryMist, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontWeight: '800', fontSize: 18 }}>{n}</Text>
                </Pressable>
              ))}
            </View>
            <Button label="Release payment and submit" bg={colors.success} disabled={rating === 0} onPress={release} />
          </>
        ) : (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <StateIcon name="check" bg={colors.successSoft} color={colors.success} size={64} radius={22} />
            <Text style={{ fontSize: 20, fontWeight: '800' }}>Payment released</Text>
            <Text style={{ lineHeight: 20, color: colors.muted, textAlign: 'center' }}>Thank you for your rating. It stays anonymous.</Text>
            <Button
              label="Back to doctors"
              style={{ alignSelf: 'stretch' }}
              onPress={() => {
                setSheet('none');
                router.navigate('/doctors');
              }}
            />
          </View>
        )}
      </Sheet>
    </View>
  );
}

function Banner({ children, bg, fg, action, actionBg, actionFg, onAction }: { children: React.ReactNode; bg: string; fg: string; action: string; actionBg: string; actionFg: string; onAction: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: bg }}>
      <Text style={{ flex: 1, fontSize: 12, lineHeight: 16, color: fg }}>{children}</Text>
      <SmallButton label={action} height={32} bg={actionBg} fg={actionFg} style={{ borderRadius: 10, paddingHorizontal: 12 }} onPress={onAction} />
    </View>
  );
}
