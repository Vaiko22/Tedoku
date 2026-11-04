import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { colors, doctorsApi, formatNaira, patientApi } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { TabBar } from '@/components/TabBar';
import { Avatar, Card, Chip, ChipGroup, Field, Screen, SmallButton, Sub, Title, VerifiedBadge } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useSession } from '@/lib/session';

/** 1. Doctor list */
export default function Doctors() {
  const { draft } = useSession();
  const me = useQuery(() => patientApi.me());
  const [q, setQ] = useState('');
  const [spec, setSpec] = useState('All');
  const specialties = useQuery(() => doctorsApi.specialties());
  const list = useQuery(() => doctorsApi.list({ specialty: spec, q }), [spec, q]);
  const alias = draft.alias || me.data?.alias || '';

  return (
    <Screen footer={<TabBar active="Doctors" />}>
      <View>
        <Title>Doctors</Title>
        <Text style={{ marginTop: 6, lineHeight: 20, color: colors.muted }}>
          Every doctor here is verified. You appear as <B>{alias}</B>, never by name.
        </Text>
      </View>
      <Field accessibilityLabel="Search doctors" placeholder="Search by name or specialty" value={q} onChangeText={setQ} />
      <ChipGroup>
        {['All', ...(specialties.data ?? [])].map((s) => (
          <Chip key={s} label={s} on={spec === s} onPress={() => setSpec(s)} />
        ))}
      </ChipGroup>
      {list.data?.length === 0 && (
        <Card>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>No doctors match. Try another specialty.</Text>
        </Card>
      )}
      {(list.data ?? []).map((d) => (
        <Pressable key={d.id} accessibilityRole="link" accessibilityLabel={`${d.name}, ${d.specialty}`} onPress={() => router.push({ pathname: '/doctor/[id]', params: { id: d.id } })}>
          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Avatar initials={d.initials} tint={d.tint} size={52} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 16, fontWeight: '800' }}>{d.name}</Text>
                <Text style={{ fontSize: 13, color: colors.muted }}>{d.specialty}</Text>
              </View>
              <VerifiedBadge boxed />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                <Text style={{ color: colors.ink, fontWeight: '700' }}>{d.rating.toFixed(1)}</Text> ({d.ratingCount} ratings)
              </Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>{d.languages.join(', ')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800' }}>
                  {formatNaira(d.priceNaira)} <Text style={{ fontSize: 12, fontWeight: '500', color: colors.muted }}>per chat</Text>
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: d.available ? colors.success : colors.muted }}>{d.availabilityLabel}</Text>
              </View>
              <SmallButton
                label="Chat"
                bg={colors.primary}
                fg="#fff"
                height={48}
                style={{ paddingHorizontal: 22, borderRadius: 14 }}
                onPress={() => router.push({ pathname: '/checkout/[doctorId]', params: { doctorId: d.id } })}
              />
            </View>
          </Card>
        </Pressable>
      ))}
      <Sub style={{ fontSize: 12, textAlign: 'center' }}>Pay in naira or USDC. Your payment is held until your chat is complete.</Sub>
    </Screen>
  );
}
