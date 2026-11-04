import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, platformApi, providerApi } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { InboxCard } from '@/components/InboxCard';
import { PROVIDER_TABS, TabBar } from '@/components/TabBar';
import { Alert, Avatar, Card, Loading, Row, Screen, Sub, TextLink, Toggle } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

/** 7. Doctor home after approval */
export default function ProviderHome() {
  const dash = useQuery(() => providerApi.dashboard());
  const settings = useQuery(() => platformApi.settings());
  const [available, setAvailable] = useState(false);
  const [banner, setBanner] = useState(true);

  useEffect(() => {
    if (dash.data) setAvailable(dash.data.available);
  }, [dash.data]);

  if (!dash.data) return <Loading />;
  const d = dash.data;
  const done = d.setupTasks.filter((t) => t.done).length;
  const fee = settings.data?.feePercent ?? 10;

  const toggle = (v: boolean) => {
    setAvailable(v);
    void providerApi.setAvailability(v);
  };

  return (
    <Screen footer={<TabBar active="Home" tabs={PROVIDER_TABS} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar initials={d.initials} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: colors.muted }}>Good morning</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>{d.name}</Text>
        </View>
      </View>

      {banner && d.justApproved && (
        <LinearGradient colors={[colors.primaryDeep, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 22, padding: 18, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,.18)', borderRadius: 12, paddingVertical: 5, paddingHorizontal: 10 }}>
            <Icon name="shield" size={14} color="#fff" strokeWidth={2} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Verified provider</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', paddingRight: 24 }}>You are approved. Welcome to Tedoku.</Text>
          <Text style={{ lineHeight: 21, color: '#E9DDF3' }}>
            Your licence was checked and your verified badge is now on your profile. Finish setup below, then switch on availability to start receiving chats.
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" onPress={() => setBanner(false)} style={{ position: 'absolute', top: 10, right: 12, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={18} color="#E9DDF3" />
          </Pressable>
        </LinearGradient>
      )}

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800' }}>{available ? 'You are available' : 'You are offline'}</Text>
          <Sub style={{ fontSize: 12 }}>{available ? 'Patients can send you chat requests' : 'Switch on to start receiving requests'}</Sub>
        </View>
        <Toggle label="Availability" size="lg" value={available} onChange={toggle} onColor={colors.success} />
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {d.stats.map((s, i) => (
          <Card key={i} style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12 }}>
            <Sub style={{ fontSize: 12 }}>{s.label}</Sub>
            <Text style={{ fontSize: s.value.length > 7 ? 17 : 20, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>
              {s.value}
            </Text>
            <Sub style={{ fontSize: 11 }}>{s.note}</Sub>
          </Card>
        ))}
      </View>

      {done < d.setupTasks.length && (
        <Card style={{ paddingBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '800' }}>Finish setting up</Text>
            <Sub style={{ fontSize: 12 }}>
              {done} of {d.setupTasks.length} done
            </Sub>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primaryMist, marginTop: 10, marginBottom: 4 }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primary, width: `${(done / d.setupTasks.length) * 100}%` }} />
          </View>
          {d.setupTasks.map((t, i) => (
            <Row key={t.label} last={i === d.setupTasks.length - 1} onPress={() => router.navigate(t.target === 'earnings' ? '/provider/earnings' : '/provider/profile')}>
              <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: t.done ? colors.successSoft : colors.primaryMist }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: t.done ? colors.successDeep : colors.muted }}>{t.done ? '✓' : '·'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{t.label}</Text>
                <Sub style={{ fontSize: 12 }}>{t.note}</Sub>
              </View>
              <Icon name="chevron" color={colors.muted} />
            </Row>
          ))}
        </Card>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, fontWeight: '800' }}>New requests</Text>
        <TextLink label="See all" onPress={() => router.navigate('/provider/chats')} />
      </View>
      {d.requests.map((x) => (
        <Pressable key={x.id} accessibilityRole="link" onPress={() => router.navigate('/provider/chats')}>
          <InboxCard x={x} />
        </Pressable>
      ))}
      <Alert tone="info">
        Patient payments are held in escrow and released to your payout wallet when a chat is marked complete. Tedoku keeps a {fee}% introductory fee.
      </Alert>
    </Screen>
  );
}
