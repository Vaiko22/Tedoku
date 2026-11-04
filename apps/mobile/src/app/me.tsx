import { useEffect, useState } from 'react';
import { Alert as RNAlert, View } from 'react-native';
import { router } from 'expo-router';
import { authApi, colors, formatUsdc, initialsOf, patientApi, walletApi } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { Avatar, Card, Lbl, Loading, Mono, Row, Screen, SmallButton, Sub, Toggle } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useCopy } from '@/lib/clipboard';
import { useSession } from '@/lib/session';

/** 1. Patient profile */
export default function Me() {
  const { setSession } = useSession();
  const me = useQuery(() => patientApi.me());
  const wallet = useQuery(() => walletApi.me());
  const { copied, copy } = useCopy();
  const [lock, setLock] = useState(false);
  const [discreet, setDiscreet] = useState(false);

  useEffect(() => {
    if (me.data) {
      setLock(me.data.appLock);
      setDiscreet(me.data.discreetIcon);
    }
  }, [me.data]);

  if (!me.data) return <Loading />;
  const p = me.data;

  const setSetting = (key: 'appLock' | 'discreetIcon', v: boolean) => {
    (key === 'appLock' ? setLock : setDiscreet)(v);
    void patientApi.updateSettings({ [key]: v });
  };
  const signOut = async () => {
    await authApi.signOut();
    setSession(null);
    router.replace('/welcome');
  };
  const confirmDelete = () =>
    RNAlert.alert('Delete everything?', 'This removes your logs, chats and questions for good.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void patientApi.deleteEverything().then(signOut) },
    ]);

  return (
    <Screen gap={12} footer={<TabBar active="Me" />}>
      <View style={{ alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Avatar initials={initialsOf(p.fullName)} size={76} color={colors.primary} />
        <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.4 }}>{p.fullName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.primarySoft }}>
          <Icon name="lock" size={14} color={colors.primaryDeep} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primaryDeep }}>Private ID: {p.alias}</Text>
        </View>
        <Sub style={{ textAlign: 'center', maxWidth: 290 }}>Only you can see your name. Doctors see your private ID, which cannot be changed.</Sub>
      </View>

      <Lbl style={{ marginTop: 6, marginHorizontal: 4 }}>Account</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Row>
          <Item title="Email or phone" sub={p.contact} />
        </Row>
        <Row last>
          <Item title="Date of birth" sub={p.dateOfBirth} />
        </Row>
      </Card>

      <Lbl style={{ marginTop: 6, marginHorizontal: 4 }}>Privacy and sharing</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Row onPress={() => router.push('/privacy')}>
          <Item title="Who can see my info" sub={`${p.activeGrants} doctors have access right now`} />
          <Icon name="chevron" color={colors.muted} />
        </Row>
        <Row>
          <Item title="App lock" sub="Ask for PIN or biometrics on every open" />
          <Toggle label="App lock" value={lock} onChange={(v) => setSetting('appLock', v)} />
        </Row>
        <Row last>
          <Item title="Discreet app icon and name" sub="Looks like a generic notes app" />
          <Toggle label="Discreet icon" value={discreet} onChange={(v) => setSetting('discreetIcon', v)} />
        </Row>
      </Card>

      <Lbl style={{ marginTop: 6, marginHorizontal: 4 }}>Wallet and payments</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <View style={{ gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ fontSize: 15, fontWeight: '600' }}>In-app wallet</Text>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>{wallet.data ? formatUsdc(wallet.data.balanceUsdc) : '—'}</Text>
          </View>
          <Sub style={{ fontSize: 12 }}>Only needed if you pay for chats in USDC. Network fees are covered.</Sub>
          {wallet.data && <Mono>{wallet.data.address}</Mono>}
          <SmallButton label={copied ? 'Copied' : 'Copy deposit address'} onPress={() => wallet.data && copy(wallet.data.address)} />
          <SmallButton label="Top up wallet" bg={colors.water} fg="#fff" onPress={() => router.push('/top-up')} />
        </View>
        {/* PLACEHOLDER: receipts screen is not in the design yet. */}
        <Row last onPress={() => {}}>
          <Item title="Receipts" sub="Your past payments in naira and USDC" />
          <Icon name="chevron" color={colors.muted} />
        </Row>
      </Card>

      <Lbl style={{ marginTop: 6, marginHorizontal: 4 }}>Your data</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Row onPress={() => void patientApi.exportData().then(() => RNAlert.alert('Export requested', 'We will send a readable copy of your data to your email or phone.'))}>
          <Item title="Export my data" sub="A readable copy of everything you logged" />
          <Icon name="chevron" color={colors.muted} />
        </Row>
        <Row last onPress={confirmDelete}>
          <Item title="Delete everything" sub="Removes your logs, chats and questions for good" danger />
        </Row>
      </Card>

      <Text accessibilityRole="button" onPress={signOut} style={{ marginTop: 6, textAlign: 'center', fontWeight: '700', fontSize: 15, color: colors.muted, padding: 12 }}>
        Sign out
      </Text>
    </Screen>
  );
}

function Item({ title, sub, danger }: { title: string; sub: string; danger?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: danger ? colors.danger : colors.ink }}>{title}</Text>
      <Text style={{ fontSize: 12, fontWeight: '500', color: danger ? colors.dangerDeep : colors.muted, lineHeight: 16 }}>{sub}</Text>
    </View>
  );
}
