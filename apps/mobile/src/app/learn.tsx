import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { askApi, colors, type AskReply } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { Card, Field, Lbl, Segmented, SmallButton, TextLink, Title } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

type Msg = { id: number; me: true; text: string } | { id: number; me: false; reply: AskReply };
const TINTS = ['#FBE3EA', '#EFE6F5', '#DCF0F5', '#E3F3EC', '#ECEDFB', '#FFF0D9'];
/** PLACEHOLDER: link to a hospital finder once one is chosen. */
const HOSPITAL_FINDER_URL = 'https://www.google.com/maps/search/hospital';

/** 6–9. Ask Tedoku (Ask and Library tabs) */
export default function Learn() {
  const { start } = useLocalSearchParams<{ start?: string }>();
  const [tab, setTab] = useState<'ask' | 'library'>(start === 'library' ? 'library' : 'ask');
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, paddingBottom: 10 }}>
        <Title>Ask Tedoku</Title>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4, marginBottom: 12 }}>
          <Icon name="lock" size={14} color={colors.muted} />
          <Text style={{ fontSize: 13, color: colors.muted }}>Anonymous. Never linked to your name.</Text>
        </View>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'ask', label: 'Ask' },
            { value: 'library', label: 'Library' },
          ]}
        />
      </View>
      {tab === 'ask' ? <Ask urgentStart={start === 'urgent'} /> : <Library />}
      <TabBar active="Learn" />
    </View>
  );
}

function Ask({ urgentStart }: { urgentStart: boolean }) {
  const suggestions = useQuery(() => askApi.suggestions());
  const [msgs, setMsgs] = useState<Msg[]>(urgentStart ? [{ id: 0, me: false, reply: { kind: 'urgent' } }] : []);
  const [draft, setDraft] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);

  const ask = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    const id = Date.now();
    setMsgs((m) => [...m, { id, me: true, text: t }]);
    setDraft('');
    const reply = await askApi.ask(t);
    setMsgs((m) => [...m, { id: id + 1, me: false, reply }]);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <>
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Card style={{ paddingVertical: 14 }}>
          <Text style={{ lineHeight: 21 }}>Ask me anything about your body. I answer only from sources reviewed by verified doctors, and I never diagnose.</Text>
        </Card>
        {msgs.length === 0 && (
          <View style={{ gap: 8, alignItems: 'flex-start' }}>
            <Lbl>Try asking</Lbl>
            {(suggestions.data ?? []).map((s) => (
              <Pressable key={s} accessibilityRole="button" onPress={() => ask(s)} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.promptBorder }}>
                <Text style={{ fontWeight: '600', color: colors.primaryDeep }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {msgs.map((m) =>
          m.me ? (
            <View key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '80%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.primary }}>
              <Text style={{ color: '#fff', lineHeight: 20 }}>{m.text}</Text>
            </View>
          ) : (
            <Reply key={m.id} reply={m.reply} />
          ),
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: colors.tabBorder, backgroundColor: colors.bg }}>
        <View style={{ flex: 1 }}>
          <Field accessibilityLabel="Your question" placeholder="Ask anything about your body" value={draft} onChangeText={setDraft} onSubmitEditing={() => ask(draft)} returnKeyType="send" style={{ height: 46 }} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Send question" onPress={() => ask(draft)} style={{ width: 46, height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="send" color="#fff" />
        </Pressable>
      </View>
    </>
  );
}

function Reply({ reply }: { reply: AskReply }) {
  if (reply.kind === 'urgent')
    return (
      <View accessibilityRole="alert" style={{ padding: 16, borderRadius: 22, backgroundColor: colors.dangerSoft, borderWidth: 1.5, borderColor: colors.dangerBorder, gap: 10 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.dangerInk }}>This could be urgent</Text>
        <Text style={{ lineHeight: 21, color: colors.dangerInk }}>
          Please get medical help now. In Nigeria you can call 112 for emergencies, or go to the nearest hospital. If you are thinking about harming yourself, contact a crisis line or someone you trust right away.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SmallButton label="Call 112" bg={colors.danger} fg="#fff" style={{ flex: 1 }} onPress={() => Linking.openURL('tel:112')} />
          <SmallButton label="Find a hospital" bg="#fff" fg={colors.dangerInk} borderColor={colors.dangerBorder} style={{ flex: 1 }} onPress={() => Linking.openURL(HOSPITAL_FINDER_URL)} />
        </View>
      </View>
    );
  if (reply.kind === 'none')
    return (
      <Card style={{ paddingVertical: 14, gap: 8 }}>
        <Text style={{ lineHeight: 21 }}>I do not have a doctor-reviewed answer for that yet, and I would rather not guess. You can ask a verified doctor privately.</Text>
        <TextLink label="Find a doctor" size={13} onPress={() => router.navigate('/doctors')} />
      </Card>
    );
  return (
    <Card style={{ paddingVertical: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon name="shield" size={13} color={colors.success} strokeWidth={2.2} />
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>Reviewed answer</Text>
      </View>
      <Text style={{ fontSize: 16, fontWeight: '800' }}>{reply.title}</Text>
      <Text style={{ lineHeight: 22 }}>{reply.body}</Text>
      <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.warningSoft }}>
        <Text style={{ fontSize: 13, lineHeight: 19, color: colors.warningInk }}>
          <B>When to see a doctor:</B> {reply.whenToSee}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 11, color: colors.muted, flex: 1 }}>Sources reviewed by a verified doctor</Text>
        <TextLink label="Ask a doctor" size={13} onPress={() => router.navigate('/doctors')} />
      </View>
    </Card>
  );
}

function Library() {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('All');
  const [open, setOpen] = useState<string | null>(null);
  const topics = useQuery(() => askApi.topics());
  const articles = useQuery(() => askApi.articles({ topic, q }), [topic, q]);
  const dict = useQuery(() => askApi.dictionary());
  const terms = (dict.data ?? []).filter((d) => (d.word + ' ' + d.definition).toLowerCase().includes(q.toLowerCase()));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 }} keyboardShouldPersistTaps="handled">
      <Field accessibilityLabel="Search the library" placeholder="Search topics and terms" value={q} onChangeText={setQ} />
      <Lbl>Browse by topic</Lbl>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {(topics.data ?? []).map((t, i) => (
          <Pressable
            key={t}
            accessibilityRole="button"
            accessibilityState={{ selected: topic === t }}
            onPress={() => setTopic(topic === t ? 'All' : t)}
            style={{ width: '48%', flexGrow: 1, padding: 14, borderRadius: 18, backgroundColor: TINTS[i % TINTS.length], borderWidth: 2, borderColor: topic === t ? colors.primary : 'transparent' }}
          >
            <Text style={{ fontWeight: '800', lineHeight: 18 }}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <Lbl>Articles</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        {(articles.data ?? []).map((a, i, all) => (
          <View key={a.id} style={{ paddingVertical: 12, borderBottomWidth: i === all.length - 1 ? 0 : 1, borderBottomColor: colors.divider }}>
            <Text style={{ fontWeight: '700', lineHeight: 19 }}>{a.title}</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>{a.topic} · Reviewed by a verified doctor</Text>
          </View>
        ))}
        {articles.data?.length === 0 && <Text style={{ paddingVertical: 14, color: colors.muted }}>Nothing found. Try another word or topic.</Text>}
      </Card>
      <Lbl>Body dictionary</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        {terms.map((d, i) => {
          const isOpen = open === d.word;
          return (
            <View key={d.word} style={{ borderBottomWidth: i === terms.length - 1 ? 0 : 1, borderBottomColor: colors.divider }}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                onPress={() => setOpen(isOpen ? null : d.word)}
                style={{ paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '700' }}>{d.word}</Text>
                <Text style={{ fontSize: 18, color: colors.primary }}>{isOpen ? '−' : '+'}</Text>
              </Pressable>
              {isOpen && <Text style={{ paddingBottom: 12, lineHeight: 21, color: colors.inkSoft }}>{d.definition}</Text>}
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}
