import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, doctorsApi, formatNaira, shortAddress } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { Avatar, BackButton, Button, Card, Lbl, Loading, Screen, Sub } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

/** 3. Doctor public profile */
export default function DoctorProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery(() => doctorsApi.detail(id), [id]);
  const [credOpen, setCredOpen] = useState(false);
  if (!q.data) return <Loading />;
  const d = q.data;

  return (
    <Screen
      gap={12}
      footer={
        <>
          <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.tabBorder }}>
            <Button label={`Chat from ${formatNaira(d.priceNaira)}`} onPress={() => router.push({ pathname: '/checkout/[doctorId]', params: { doctorId: d.id } })} />
            <Sub style={{ textAlign: 'center', marginTop: 6, fontSize: 12 }}>Pay in naira or USDC. You appear as your private ID.</Sub>
          </View>
          <TabBar active="Doctors" />
        </>
      }
    >
      <BackButton label="Back to doctors" />
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Avatar initials={d.initials} tint={d.tint} size={84} />
        <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.4 }}>{d.name}</Text>
        <Text style={{ color: colors.muted }}>
          {d.specialty} · {d.languages.join(', ')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: credOpen }}
          onPress={() => setCredOpen(!credOpen)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.successSoft }}
        >
          <Icon name="shield" size={14} color={colors.success} strokeWidth={2.2} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.success }}>Verified · tap to check</Text>
        </Pressable>
      </View>

      {credOpen && (
        <Card style={{ paddingVertical: 14, gap: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '800' }}>Credential check</Text>
          <Sub>License checked against the {d.council} register by the Tedoku review team.</Sub>
          <Pair k="Verified on" v={d.verifiedOn} />
          <Pair k="Renews on" v={d.renewsOn} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: colors.muted }}>On-chain proof</Text>
            <Text style={{ fontSize: 13, fontFamily: 'Menlo', color: colors.primary }}>{shortAddress(d.onChainProof)}</Text>
          </View>
          <Sub style={{ fontSize: 12 }}>Anyone can confirm this record. If it is revoked, the badge disappears.</Sub>
        </Card>
      )}

      <Card style={{ paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-around' }}>
        <Stat value={d.rating.toFixed(1)} label={`${d.ratingCount} ratings`} />
        <Stat value={d.available ? 'Available' : 'Away'} label={d.available ? 'Replies now' : d.availabilityLabel} />
        <Stat value={formatNaira(d.priceNaira)} label="per chat" />
      </Card>

      <Lbl>About</Lbl>
      <Card style={{ paddingVertical: 14 }}>
        <Text style={{ lineHeight: 22 }}>{d.about}</Text>
      </Card>

      <Lbl>Ratings</Lbl>
      <Card style={{ paddingVertical: 14, gap: 8 }}>
        {d.ratingBreakdown.map((b) => (
          <View key={b.stars} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ width: 14, fontSize: 12, fontWeight: '600' }}>{b.stars}</Text>
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.primaryMist, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${b.percent}%`, borderRadius: 4, backgroundColor: colors.star }} />
            </View>
            <Text style={{ width: 34, textAlign: 'right', fontSize: 12, fontWeight: '600', color: colors.muted }}>{b.percent}%</Text>
          </View>
        ))}
        <Sub style={{ fontSize: 12 }}>Ratings are anonymous and only come from completed, paid consultations.</Sub>
      </Card>
      {d.reviews.map((r) => (
        <Card key={r.text} style={{ paddingVertical: 14 }}>
          <Sub style={{ fontSize: 12, marginBottom: 4 }}>Anonymous patient</Sub>
          <Text style={{ lineHeight: 21 }}>{r.text}</Text>
        </Card>
      ))}
    </Screen>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13, color: colors.muted }}>{k}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700' }}>{v}</Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Sub style={{ fontSize: 12 }}>{label}</Sub>
    </View>
  );
}
