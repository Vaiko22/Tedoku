import { useState } from 'react';
import { View } from 'react-native';
import { colors, formatAmount, isWalletAddress, platformApi, providerApi, type Rail } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { PROVIDER_TABS, TabBar } from '@/components/TabBar';
import { Button, Card, Chip, Field, Lbl, Loading, Mono, Row, Screen, Segmented, Sheet, SmallButton, Sub } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useCopy } from '@/lib/clipboard';

/** 5–7. Earnings and escrow (naira / USDC), and the withdraw sheet. */
export default function ProviderEarnings() {
  const [rail, setRail] = useState<Rail>('naira');
  const e = useQuery(() => providerApi.earnings(rail), [rail]);
  const profile = useQuery(() => providerApi.profile());
  const settings = useQuery(() => platformApi.settings());
  const { copied, copy } = useCopy();
  const [sheet, setSheet] = useState(false);
  const [pct, setPct] = useState(50);
  const [addr, setAddr] = useState('');
  const [toast, setToast] = useState<Rail | null>(null);
  const [busy, setBusy] = useState(false);

  const isU = rail === 'usdc';
  const cc = isU ? colors.water : colors.primary;
  const fee = settings.data?.feePercent ?? 10;
  if (!e.data) return <Loading />;
  const d = e.data;
  const fmt = (v: number) => formatAmount(v, rail);
  const amt = isU ? Math.floor(d.available * pct) / 100 : Math.floor((d.available * pct) / 100);
  const addrOk = isWalletAddress(addr);

  const confirm = async () => {
    setBusy(true);
    try {
      e.setData(await providerApi.withdraw(rail, amt, isU ? addr : undefined));
      setSheet(false);
      setToast(rail);
      setAddr('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen footer={<TabBar active="Earnings" tabs={PROVIDER_TABS} />}>
        <View>
          <Text style={{ fontSize: 13, color: colors.muted }}>{profile.data?.name ?? ''}</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>Earnings and escrow</Text>
        </View>
        <Segmented
          value={rail}
          onChange={(r) => (setRail(r), setToast(null))}
          options={[
            { value: 'naira', label: 'Naira' },
            { value: 'usdc', label: 'USDC' },
          ]}
        />
        {toast === rail && (
          <View accessibilityRole="alert" style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.successSoft }}>
            <Text style={{ fontWeight: '600', color: colors.successDeep }}>
              {isU ? 'Withdrawal requested. It will arrive at the wallet you entered.' : 'Withdrawal requested. It will be sent to your bank account.'}
            </Text>
          </View>
        )}
        <Card style={{ gap: 10 }}>
          <Lbl>Available to withdraw</Lbl>
          <Text style={{ fontSize: 34, fontWeight: '800', letterSpacing: -0.7, color: cc }}>{fmt(d.available)}</Text>
          <Button label={isU ? 'Withdraw USDC' : 'Withdraw to bank'} bg={cc} onPress={() => setSheet(true)} />
          {isU && <Button label="Convert USDC to naira (coming soon)" disabled bg={colors.primaryMist} fg={colors.primaryDeep} height={48} />}
        </Card>
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Lbl>In escrow</Lbl>
            <Text style={{ fontSize: 20, fontWeight: '800' }}>{fmt(d.held)}</Text>
          </View>
          <Sub style={{ fontSize: 12 }}>
            Patient payments are held until each chat is complete. Then your share moves to your available balance, after the platform fee (introductory rate: {fee}%).
          </Sub>
          {d.escrow.map((x, i) => (
            <Row key={x.alias} last={i === d.escrow.length - 1}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontWeight: '700' }}>{x.alias}</Text>
                <Sub style={{ fontSize: 12 }}>{x.status}</Sub>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: '800' }}>{fmt(x.share)}</Text>
                <Sub style={{ fontSize: 12 }}>of {fmt(x.gross)}</Sub>
              </View>
            </Row>
          ))}
        </Card>
        <Card style={{ gap: 8 }}>
          <Lbl>Where it is stored</Lbl>
          <Text style={{ lineHeight: 21 }}>
            {isU
              ? 'Your USDC is stored in your Tedoku payout wallet, created for you when you joined.'
              : `Your naira balance is held by Tedoku and paid out to your bank account ending ${d.bankLast4} when you withdraw.`}
          </Text>
          {isU && (
            <>
              <Mono>{d.payoutWallet}</Mono>
              <SmallButton label={copied ? 'Copied' : 'Copy address'} onPress={() => copy(d.payoutWallet)} />
              <Sub style={{ fontSize: 12 }}>Tedoku payout wallet on the Base network. Example address.</Sub>
            </>
          )}
        </Card>
        <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          <Lbl style={{ paddingTop: 12, paddingBottom: 2 }}>Recent activity</Lbl>
          {d.history.map((h, i) => (
            <Row key={h.text + i} last={i === d.history.length - 1}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontWeight: '600' }}>{h.text}</Text>
                <Sub style={{ fontSize: 12 }}>{h.when}</Sub>
              </View>
              <B style={{ color: h.amount > 0 ? colors.success : colors.ink }}>{(h.amount > 0 ? '+' : '−') + fmt(Math.abs(h.amount))}</B>
            </Row>
          ))}
        </Card>
      </Screen>

      <Sheet visible={sheet} onClose={() => setSheet(false)}>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>{isU ? 'Withdraw USDC' : 'Withdraw to your bank'}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[25, 50, 100].map((p) => (
            <Chip key={p} label={p === 100 ? 'All' : p + '%'} flex color={cc} on={pct === p} onPress={() => setPct(p)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.surfaceAlt }}>
          <Sub>You will withdraw</Sub>
          <Text style={{ fontSize: 22, fontWeight: '700' }}>{fmt(amt)}</Text>
        </View>
        {isU ? (
          <View style={{ gap: 6 }}>
            <Lbl>Send to this wallet address (Base network)</Lbl>
            <Field accessibilityLabel="Wallet address" placeholder="0x…" autoCapitalize="none" autoCorrect={false} value={addr} onChangeText={(v) => setAddr(v.trim())} />
            {addr.length > 0 && !addrOk && (
              <Text accessibilityRole="alert" style={{ fontSize: 12, color: colors.danger, fontWeight: '600' }}>
                Enter a valid wallet address: it starts with 0x and has 42 characters.
              </Text>
            )}
          </View>
        ) : (
          <Text style={{ lineHeight: 21 }}>
            To your bank account ending <B>{d.bankLast4}</B>. You can change this from your profile.
          </Text>
        )}
        <Button label="Confirm withdrawal" bg={cc} disabled={amt <= 0 || (isU && !addrOk)} loading={busy} onPress={confirm} />
      </Sheet>
    </View>
  );
}
