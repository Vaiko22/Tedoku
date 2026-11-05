import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, consultationsApi, providerApi, type ChatMessage } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { Bubble } from '@/components/Bubble';
import { PROVIDER_TABS, TabBar } from '@/components/TabBar';
import { Avatar, Button, Card, Chip, Field, Lbl, Loading, Sheet, SmallButton, Sub } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

const CARE = ['Physical', 'Mental', 'Emotional'];
const URGENCY = ['Routine', 'Soon', 'Urgent'];
const POLL_MS = 3000;

/**
 * 2–4. Provider chat with an anonymous patient: refer to in-person care, finish.
 * While on placeholder data, every inbox item opens the same sample consultation.
 */
export default function ProviderChat() {
  const { id: consultationId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const c = useQuery(() => consultationsApi.get(consultationId), [consultationId]);
  const quick = useQuery(() => providerApi.quickReplies());
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sheet, setSheet] = useState<'none' | 'refer' | 'finish'>('none');
  const [care, setCare] = useState('Physical');
  const [urgency, setUrgency] = useState('Soon');
  const [note, setNote] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (c.data) setMsgs(c.data.messages);
  }, [c.data]);
  // PLACEHOLDER: polling. Swap for a websocket or push when the backend supports it.
  useEffect(() => {
    const t = setInterval(() => void consultationsApi.messages(consultationId).then(setMsgs).catch(() => {}), POLL_MS);
    return () => clearInterval(t);
  }, [consultationId]);
  useEffect(() => {
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }, [msgs.length]);

  if (!c.data) return <Loading />;
  const k = c.data;
  const rev = k.revealed;

  const send = async () => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    const m = await consultationsApi.send(consultationId, t, 'doctor');
    setMsgs((x) => [...x, m]);
  };
  const refer = async () => {
    const m = await consultationsApi.refer(consultationId, care, urgency, note);
    setMsgs((x) => [...x, m]);
    setSheet('none');
    setNote('');
  };
  const finish = async () => {
    const m = await consultationsApi.finish(consultationId);
    setMsgs((x) => [...x, m]);
    setSheet('none');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.tabBorder, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to chats" onPress={() => router.navigate('/provider/chats')} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={24} strokeWidth={2} />
        </Pressable>
        <Avatar initials={rev?.name ? rev.name[0]! : k.patientAlias[0]!} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800' }}>{rev?.name ? `${rev.name} (${k.patientAlias})` : k.patientAlias}</Text>
          <Sub style={{ fontSize: 12 }}>
            Age range {k.patientAgeRange} · Paid {k.amountLabel}, held
          </Sub>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        {rev ? (
          <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.successSoft }}>
            <Text style={{ fontSize: 12, lineHeight: 17, color: colors.successDeep }}>
              <B>
                {k.patientAlias} shared their details with you{rev.until ? ` for ${rev.until}` : ''}.
              </B>
              {'\n'}
              {[rev.name && `Name: ${rev.name}`, rev.phone && `Phone: ${rev.phone}`].filter(Boolean).join(' · ')}
              {'\n'}Please keep this private and use it only for their care.
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.primarySoft }}>
            <Icon name="lock" size={16} color={colors.primaryDeep} />
            <Text style={{ flex: 1, fontSize: 12, lineHeight: 17, color: colors.primaryDeep }}>This patient is anonymous. You can only see their private ID.</Text>
          </View>
        )}
      </View>

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 10 }}>
        {k.sharedSummary && k.sharedSummary.length > 0 && (
          <Card style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16 }}>
            <Lbl style={{ marginBottom: 6 }}>Shared by the patient</Lbl>
            <Text style={{ fontSize: 13, lineHeight: 21 }}>{k.sharedSummary.join('\n')}</Text>
            <Sub style={{ fontSize: 12, marginTop: 6 }}>Visible until this consultation ends.</Sub>
          </Card>
        )}
        {msgs.map((m) => (
          <Bubble key={m.id} m={m} mine="doctor" />
        ))}
      </ScrollView>

      <View style={{ backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.tabBorder, paddingTop: 10, paddingHorizontal: 16, paddingBottom: 14, gap: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {(quick.data ?? []).map((q) => (
            <Pressable key={q} accessibilityRole="button" onPress={() => setDraft(q)} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.primaryMist, justifyContent: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primaryDeep }}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SmallButton label="Refer to in-person care" height={34} style={{ flex: 1, borderRadius: 10 }} onPress={() => setSheet('refer')} />
          <SmallButton label="Finish consultation" height={34} bg={colors.successSoft} fg={colors.successDeep} style={{ flex: 1, borderRadius: 10 }} onPress={() => setSheet('finish')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Field accessibilityLabel="Message" placeholder="Write a message" value={draft} onChangeText={setDraft} onSubmitEditing={send} returnKeyType="send" style={{ height: 46 }} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={send} style={{ width: 44, height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" color="#fff" />
          </Pressable>
        </View>
      </View>
      <TabBar active="Chats" tabs={PROVIDER_TABS} />

      <Sheet visible={sheet === 'refer'} onClose={() => setSheet('none')}>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>Refer to in-person care</Text>
        <Text style={{ lineHeight: 20, color: colors.muted }}>The patient must accept before anything is shared with a hospital.</Text>
        <Lbl>Type of care</Lbl>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {CARE.map((x) => (
            <Chip key={x} label={x} flex on={care === x} onPress={() => setCare(x)} />
          ))}
        </View>
        <Lbl>How soon</Lbl>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {URGENCY.map((x) => (
            <Chip key={x} label={x} flex on={urgency === x} onPress={() => setUrgency(x)} />
          ))}
        </View>
        <Lbl>Note for the patient</Lbl>
        <Field accessibilityLabel="Note for the patient" placeholder="Why you suggest this" value={note} onChangeText={setNote} />
        <Button label="Send suggestion" onPress={refer} />
      </Sheet>

      <Sheet visible={sheet === 'finish'} onClose={() => setSheet('none')}>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>Finish this consultation?</Text>
        <Text style={{ lineHeight: 21, color: colors.muted }}>
          {k.patientAlias} will be asked to confirm and rate. Payment is released to you after they confirm, or when the dispute window ends. Their shared data is removed from your view.
        </Text>
        <Button label="Finish consultation" bg={colors.success} onPress={finish} />
        <Button label="Keep chatting" bg={colors.primaryMist} fg={colors.primaryDeep} onPress={() => setSheet('none')} />
      </Sheet>
    </View>
  );
}
