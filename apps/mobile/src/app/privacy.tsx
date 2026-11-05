import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, patientApi } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { Avatar, BackButton, Card, Lbl, Row, Screen, SmallButton, Sub, Title } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

/** 2. Patient: who can see my info */
export default function Privacy() {
  const grants = useQuery(() => patientApi.grants());
  const log = useQuery(() => patientApi.accessLog());
  const [revoked, setRevoked] = useState<Record<string, boolean>>({});
  const list = (grants.data ?? []).map((g) => ({ ...g, revoked: g.revoked || !!revoked[g.id] }));
  const active = list.filter((g) => !g.revoked).length;

  const revoke = async (id: string) => {
    setRevoked({ ...revoked, [id]: true });
    await patientApi.revokeGrant(id);
  };

  return (
    <Screen gap={12} footer={<TabBar active="Me" />}>
      <BackButton label="Back to profile" onPress={() => router.navigate('/me')} />
      <View>
        <Title>Who can see my info</Title>
        <Text style={{ marginTop: 6, lineHeight: 20, color: colors.muted }}>You decide what each doctor can see, and you can take it back any time.</Text>
      </View>
      <Lbl style={{ marginHorizontal: 4, marginTop: 6 }}>Active now ({active})</Lbl>
      {grants.data && active === 0 && (
        <Card>
          <Text style={{ color: colors.muted }}>No one has access to your personal details right now.</Text>
        </Card>
      )}
      {list.map((g) => (
        <Card key={g.id} style={{ paddingVertical: 14, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Avatar initials={g.initials} tint={g.tint} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800' }}>{g.doctorName}</Text>
              <Sub style={{ fontSize: 12 }}>Sees your {g.sharing}</Sub>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: g.revoked ? colors.success : colors.muted }}>{g.revoked ? 'Access removed' : g.expiresLabel}</Text>
            <SmallButton
              label={g.revoked ? 'Revoked' : 'Revoke access'}
              disabled={g.revoked}
              bg={g.revoked ? colors.successSoft : colors.dangerSoft}
              fg={g.revoked ? colors.success : colors.dangerDeep}
              onPress={() => revoke(g.id)}
              style={{ paddingHorizontal: 16 }}
            />
          </View>
        </Card>
      ))}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4 }}>
        <Icon name="info" size={16} color={colors.muted} />
        <Text style={{ flex: 1, fontSize: 12, lineHeight: 17, color: colors.muted }}>Each share is recorded as a consent receipt. The receipt holds no personal details.</Text>
      </View>
      <Lbl style={{ marginHorizontal: 4, marginTop: 6 }}>Access log</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        {(log.data ?? []).map((l, i, all) => (
          <Row key={l.text} last={i === all.length - 1}>
            <View style={{ flex: 1 }}>
              <Text>{l.text}</Text>
              <Sub style={{ fontSize: 12 }}>{l.when}</Sub>
            </View>
          </Row>
        ))}
      </Card>
    </Screen>
  );
}
