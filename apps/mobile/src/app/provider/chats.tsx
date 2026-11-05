import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, providerApi, type ProviderInboxItem } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { InboxCard } from '@/components/InboxCard';
import { PROVIDER_TABS, TabBar } from '@/components/TabBar';
import { Avatar, Card, Screen, Segmented, SmallButton, Sub, Tag } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';

type Tab = ProviderInboxItem['status'];

/** 1. Provider inbox: requests, active and done chats. */
export default function ProviderChats() {
  const inbox = useQuery(() => providerApi.inbox());
  const profile = useQuery(() => providerApi.profile());
  const [tab, setTab] = useState<Tab>('request');
  const items = inbox.data ?? [];
  const count = (s: Tab) => items.filter((i) => i.status === s).length;
  const list = items.filter((i) => i.status === tab);

  const accept = async (id: string) => {
    inbox.setData(items.map((i) => (i.id === id ? { ...i, status: 'active' } : i)));
    await providerApi.accept(id);
  };
  const decline = async (id: string) => {
    inbox.setData(items.filter((i) => i.id !== id));
    await providerApi.decline(id);
  };

  return (
    <Screen footer={<TabBar active="Chats" tabs={PROVIDER_TABS} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar initials={profile.data?.initials ?? ''} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: colors.muted }}>{profile.data?.name ?? ''}</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>Chats</Text>
        </View>
        {profile.data && (profile.data.available ? <Tag label="Available" /> : <Tag label="Offline" bg={colors.primaryMist} fg={colors.muted} />)}
      </View>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'request', label: `Requests (${count('request')})` },
          { value: 'active', label: `Active (${count('active')})` },
          { value: 'done', label: `Done (${count('done')})` },
        ]}
      />
      {inbox.data && list.length === 0 && (
        <Card>
          <Text style={{ textAlign: 'center', color: colors.muted }}>Nothing here right now.</Text>
        </Card>
      )}
      {list.map((x) => (
        <InboxCard key={x.id} x={x}>
          {x.status === 'request' && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SmallButton label="Accept chat" bg={colors.primary} fg="#fff" style={{ flex: 1 }} onPress={() => accept(x.id)} />
              <SmallButton label="Decline" bg={colors.primaryMist} onPress={() => decline(x.id)} style={{ paddingHorizontal: 16 }} />
            </View>
          )}
          {x.status === 'active' && <SmallButton label="Open chat" onPress={() => router.push({ pathname: '/provider/chat/[id]', params: { id: x.id } })} />}
          {x.status === 'done' && x.doneNote && <Sub style={{ fontSize: 12 }}>{x.doneNote}</Sub>}
        </InboxCard>
      ))}
    </Screen>
  );
}
