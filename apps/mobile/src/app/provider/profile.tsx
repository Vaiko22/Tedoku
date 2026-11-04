import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { authApi, colors, formatNaira, isUsingMocks, platformApi, providerApi } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { PROVIDER_TABS, TabBar } from '@/components/TabBar';
import { Avatar, Card, Chip, ChipGroup, Lbl, Loading, Mono, Row, Screen, SmallButton, StepBtn, Sub, Tag, TextLink, Toggle, VerifiedBadge } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useCopy } from '@/lib/clipboard';
import { useSession } from '@/lib/session';

/** 4. Doctor: my profile */
export default function ProviderProfile() {
  const { setSession } = useSession();
  const q = useQuery(() => providerApi.profile());
  const all = useQuery(() => providerApi.languages());
  const settings = useQuery(() => platformApi.settings());
  const { copied, copy } = useCopy();
  const [available, setAvailable] = useState(true);
  const [fee, setFee] = useState(5000);
  const [langs, setLangs] = useState<string[]>([]);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (!q.data) return;
    setAvailable(q.data.available);
    setFee(q.data.feeNaira);
    setLangs(q.data.languages);
  }, [q.data]);

  if (!q.data) return <Loading />;
  const p = q.data;
  const pf = settings.data?.feePercent ?? 10;

  const setAvail = (v: boolean) => {
    setAvailable(v);
    void providerApi.setAvailability(v);
  };
  const changeFee = (v: number) => {
    setFee(v);
    void providerApi.updateProfile({ feeNaira: v });
  };
  const toggleLang = (l: string) => {
    setLangs(langs.includes(l) ? langs.filter((x) => x !== l) : [...langs, l]);
    setSaved(false);
  };
  const saveLangs = async () => {
    await providerApi.updateProfile({ languages: langs });
    setSaved(true);
  };
  const signOut = async () => {
    await authApi.signOut();
    setSession(null);
    router.replace('/welcome');
  };

  return (
    <Screen gap={12} footer={<TabBar active="Profile" tabs={PROVIDER_TABS} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar initials={p.initials} size={64} />
        <View>
          <Text style={{ fontSize: 21, fontWeight: '800', letterSpacing: -0.4 }}>{p.name}</Text>
          <VerifiedBadge label="Verified provider" />
        </View>
      </View>

      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Row last>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600' }}>Available for new chats</Text>
            <Sub style={{ fontSize: 12 }}>{available ? 'Patients can start a chat with you now' : 'Hidden from search until you switch back on'}</Sub>
          </View>
          <Toggle label="Available for new chats" value={available} onChange={setAvail} />
        </Row>
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 4, marginTop: 6 }}>
        <Lbl>{isUsingMocks() ? 'Earnings (sample figures)' : 'Earnings'}</Lbl>
        <TextLink label="Wallet and escrow" size={13} onPress={() => router.navigate('/provider/earnings')} />
      </View>
      <Card>
        <Sub style={{ fontSize: 12 }}>This month</Sub>
        <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>{formatNaira(p.monthEarnings.total)}</Text>
        <Sub style={{ fontSize: 12 }}>
          {p.monthEarnings.chats} completed chats, after the platform fee (introductory rate: {pf}%)
        </Sub>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Mini label="Paid in naira" value={formatNaira(p.monthEarnings.naira)} />
          <Mini label="Paid in USDC" value={formatNaira(p.monthEarnings.usdcInNaira)} />
        </View>
      </Card>

      <Lbl style={{ marginHorizontal: 4, marginTop: 6 }}>Consultation fee</Lbl>
      <Card style={{ paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <StepBtn label="Lower fee" sign="−" onPress={() => changeFee(Math.max(1000, fee - 500))} />
          <Text style={{ fontSize: 24, fontWeight: '800' }}>{formatNaira(fee)}</Text>
          <StepBtn label="Raise fee" sign="+" onPress={() => changeFee(Math.min(50000, fee + 500))} />
        </View>
        <Sub style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>New prices apply to new chats only.</Sub>
      </Card>

      <Lbl style={{ marginHorizontal: 4, marginTop: 6 }}>How you get paid</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <View style={{ gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
          <Text style={{ fontSize: 15, fontWeight: '600' }}>Tedoku payout wallet (USDC)</Text>
          <Mono>{p.payoutWallet}</Mono>
          <SmallButton label={copied ? 'Copied' : 'Copy address'} onPress={() => copy(p.payoutWallet)} />
          <Sub style={{ fontSize: 12 }}>Created for you. It receives USDC from patients and cannot be changed.</Sub>
        </View>
        <Row last>
          <Item title="Naira bank account" sub={`••••${p.bankLast4} · Paid after each completed chat`} />
        </Row>
      </Card>

      <Lbl style={{ marginHorizontal: 4, marginTop: 6 }}>Contact and sign-in</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Row>
          <Item title="Email address" sub={`${p.email} · used to create your account`} />
          <Tag label="Verified" />
        </Row>
        <Row>
          <Item title="Phone number" sub={p.phone} />
          <Tag label="Verified" />
        </Row>
        <Row last>
          <Sub style={{ flex: 1, fontSize: 12 }}>Changing your email or phone needs a new verification code.</Sub>
          {/* PLACEHOLDER: edit-contact flow is not designed yet. */}
          <TextLink label="Edit" size={13} onPress={() => {}} />
        </Row>
      </Card>

      <Lbl style={{ marginHorizontal: 4, marginTop: 6 }}>Verified documents</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        {p.documents.map((x) => (
          <Row key={x.title}>
            <Item title={x.title} sub={x.detail} />
            <Tag label="Verified" />
          </Row>
        ))}
        <Row last>
          <Sub style={{ flex: 1, fontSize: 12 }}>Replacing a document sends it to the review team again.</Sub>
          {/* PLACEHOLDER: document replacement flow is not designed yet. */}
          <TextLink label="Replace" size={13} onPress={() => {}} />
        </Row>
      </Card>

      <Lbl style={{ marginHorizontal: 4, marginTop: 6 }}>Languages you speak</Lbl>
      <Card style={{ paddingVertical: 14, gap: 12 }}>
        <Sub>Patients can filter doctors by language. Pick all that you are comfortable with.</Sub>
        <ChipGroup>
          {(all.data ?? []).map((l) => (
            <Chip key={l} label={l} on={langs.includes(l)} onPress={() => toggleLang(l)} />
          ))}
        </ChipGroup>
        <SmallButton label={saved ? 'Saved' : 'Save languages'} bg={colors.primary} fg="#fff" height={48} style={{ borderRadius: 14 }} disabled={langs.length === 0 || saved} onPress={saveLangs} />
      </Card>

      <Lbl style={{ marginHorizontal: 4, marginTop: 6 }}>Credentials</Lbl>
      <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        <Row>
          <Item title="License and verification" sub={`Verified · renews on ${p.licenseRenewsOn}`} />
          <Tag label="Active" />
        </Row>
        <Row last>
          <Item title="Public profile" sub="See what patients see" />
          <TextLink label="View" size={13} onPress={() => router.push({ pathname: '/doctor/[id]', params: { id: 'd_ife' } })} />
        </Row>
      </Card>

      <Text accessibilityRole="button" onPress={signOut} style={{ marginTop: 6, textAlign: 'center', fontWeight: '700', fontSize: 15, color: colors.muted, padding: 12 }}>
        Sign out
      </Text>
    </Screen>
  );
}

function Item({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '600' }}>{title}</Text>
      <Text style={{ fontSize: 12, fontWeight: '500', color: colors.muted, lineHeight: 16 }}>{sub}</Text>
    </View>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.surfaceAlt }}>
      <Sub style={{ fontSize: 12 }}>{label}</Sub>
      <Text style={{ fontSize: 16, fontWeight: '800' }}>{value}</Text>
    </View>
  );
}
