import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  colors,
  formatNaira,
  formatUsdc,
  paymentsApi,
  patientApi,
  platformApi,
  walletApi,
  type NairaMethod,
  type PaymentResult,
  type Rail,
  type UsdcSource,
} from '@tedoku/shared';
import { Text } from '@/components/Text';
import {
  Alert,
  Avatar,
  BackButton,
  Button,
  Card,
  Chip,
  ChipGroup,
  DemoHint,
  Field,
  KeyValue,
  Lbl,
  Loading,
  Mono,
  Screen,
  Segmented,
  SmallButton,
  Spacer,
  StateIcon,
  Sub,
  VerifiedBadge,
} from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useCopy } from '@/lib/clipboard';
import { useSession } from '@/lib/session';

type Step = 'choose' | 'naira' | 'usdc' | 'processing' | 'success' | 'failed';
/** PLACEHOLDER: the gateway's list of USSD banks. */
const USSD_BANKS = ['[Bank one]', '[Bank two]'];

/** Checkout: choose how to pay, then naira (card, transfer, USSD) or USDC. */
export default function Checkout() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const { draft } = useSession();
  const checkout = useQuery(() => paymentsApi.createCheckout(doctorId), [doctorId]);
  // Admin-controlled: which rails are on, and whether USDC deposits are paused.
  const settings = useQuery(() => platformApi.settings());
  const wallet = useQuery(() => walletApi.me());
  const me = useQuery(() => patientApi.me());
  const [step, setStep] = useState<Step>('choose');
  const [rail, setRail] = useState<Rail>('naira');
  const [tab, setTab] = useState<NairaMethod>('card');
  const [source, setSource] = useState<UsdcSource>('inapp');
  const [ussdBank, setUssdBank] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const { copied, copy } = useCopy();
  const transfer = useQuery(() => (checkout.data ? paymentsApi.bankTransferDetails(checkout.data.id) : Promise.resolve(null)), [checkout.data?.id]);
  const ussd = useQuery(() => (checkout.data && ussdBank ? paymentsApi.ussdCode(checkout.data.id, ussdBank) : Promise.resolve(null)), [checkout.data?.id, ussdBank]);

  const s = settings.data;
  const usdcOn = !!s && s.usdcEnabled && !s.usdcDepositsPaused;
  const nairaOn = !s || s.nairaEnabled;
  useEffect(() => {
    if (s && !usdcOn && rail === 'usdc') setRail('naira');
    if (s && !nairaOn && usdcOn && rail === 'naira') setRail('usdc');
  }, [s, usdcOn, nairaOn, rail]);

  if (!checkout.data) return <Loading />;
  const c = checkout.data;
  const d = c.doctor;
  const alias = draft.alias || me.data?.alias || '';
  const balance = wallet.data?.balanceUsdc ?? 0;
  const low = source === 'inapp' && balance < c.amountUsdc;

  const pay = async () => {
    setStep('processing');
    const res = rail === 'naira' ? await paymentsApi.payNaira(c.id, tab) : await paymentsApi.payUsdc(c.id, source);
    setResult(res);
    setStep(res.status === 'success' ? 'success' : 'failed');
  };

  const title = step === 'choose' ? 'Checkout' : step === 'naira' ? 'Pay in naira' : step === 'usdc' ? 'Pay with USDC' : null;
  const header = title ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 }}>
      <BackButton label={step === 'choose' ? 'Back to doctors' : 'Back'} onPress={step === 'choose' ? undefined : () => setStep('choose')} />
      <Text style={{ fontSize: 20, fontWeight: '800' }}>{title}</Text>
    </View>
  ) : undefined;

  return (
    <Screen header={header} padTop={title ? 0 : 30}>
      {step === 'choose' && (
        <>
          <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14 }}>
            <Avatar initials={d.initials} tint={d.tint} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800' }}>{d.name}</Text>
              <VerifiedBadge label={`Verified · ${d.specialty}`} />
            </View>
          </Card>
          <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
            <KeyValue k="One chat consultation" v={formatNaira(c.amountNaira)} />
            <KeyValue k="Platform fee" v={<Text>{c.feeIncluded ? 'Included' : `${s?.feePercent ?? 10}%`}</Text>} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 }}>
              <Text style={{ fontWeight: '700' }}>Total</Text>
              <Text style={{ fontWeight: '700', fontSize: 18 }}>{formatNaira(c.amountNaira)}</Text>
            </View>
          </Card>
          <Lbl>How would you like to pay?</Lbl>
          {nairaOn && (
            <RadioCard on={rail === 'naira'} onPress={() => setRail('naira')} title="Pay in naira" text="Card, bank transfer or USSD" amount={formatNaira(c.amountNaira)} />
          )}
          {usdcOn && (
            <RadioCard on={rail === 'usdc'} onPress={() => setRail('usdc')} title="Pay in USDC" text="From your in-app wallet. Network fees are covered." amount={formatUsdc(c.amountUsdc)} />
          )}
          {s && !usdcOn && <Sub style={{ fontSize: 12 }}>USDC payments are paused right now. You can still pay in naira.</Sub>}
          <Alert tone="success" icon="shield">
            Your payment is held safely until your chat is complete. You are refunded automatically if the doctor does not respond.
          </Alert>
          <Spacer min={8} />
          <Button label="Continue" disabled={!nairaOn && !usdcOn} onPress={() => setStep(rail)} />
        </>
      )}

      {step === 'naira' && (
        <>
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'card', label: 'Card' },
              { value: 'transfer', label: 'Bank transfer' },
              { value: 'ussd', label: 'USSD' },
            ]}
          />
          {tab === 'card' && (
            // PLACEHOLDER: replace with the payment gateway's card SDK so card details never touch Tedoku.
            <View style={{ gap: 12 }}>
              <LabeledField label="Card number" placeholder="0000 0000 0000 0000" keyboardType="number-pad" autoComplete="cc-number" />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <LabeledField label="Expiry" placeholder="MM / YY" keyboardType="number-pad" autoComplete="cc-exp" />
                </View>
                <View style={{ flex: 1 }}>
                  <LabeledField label="CVV" placeholder="•••" keyboardType="number-pad" secureTextEntry autoComplete="cc-csc" />
                </View>
              </View>
              <Sub style={{ fontSize: 12 }}>Card payments are processed by a licensed Nigerian payment provider. Tedoku never sees your card details.</Sub>
            </View>
          )}
          {tab === 'transfer' && transfer.data && (
            <Card style={{ gap: 10 }}>
              <Text style={{ lineHeight: 21 }}>
                Transfer exactly <Text style={{ fontWeight: '700' }}>{formatNaira(c.amountNaira)}</Text> to this account using your bank app.
              </Text>
              <KeyValue k="Bank" v={transfer.data.bank} />
              <KeyValue k="Account number" v={transfer.data.accountNumber} vStyle={{ fontSize: 18, letterSpacing: 0.6 }} />
              <KeyValue k="Account name" v={transfer.data.accountName} last />
              <SmallButton label={copied ? 'Copied' : 'Copy account number'} onPress={() => copy(transfer.data!.accountNumber)} />
              <Alert tone="warning">
                This account number is only for this payment and expires in <Text style={{ fontWeight: '700' }}>{transfer.data.expiresInMinutes}:00</Text>. Sample details shown.
              </Alert>
            </Card>
          )}
          {tab === 'ussd' && (
            <Card style={{ gap: 12 }}>
              <Lbl>Your bank</Lbl>
              <ChipGroup>
                {USSD_BANKS.map((b) => (
                  <Chip key={b} label={b} on={ussdBank === b} onPress={() => setUssdBank(b)} />
                ))}
              </ChipGroup>
              <Text style={{ lineHeight: 22 }}>
                1. Pick your bank above.{'\n'}2. Dial this code on the phone linked to your account.{'\n'}3. Follow the prompts to confirm {formatNaira(c.amountNaira)}.
              </Text>
              <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 12 }}>
                <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '800', fontFamily: 'Menlo' }}>{ussd.data?.code ?? '*000*000#'}</Text>
              </View>
              <Sub style={{ fontSize: 12 }}>Example code. The real code appears after you pick your bank.</Sub>
            </Card>
          )}
          <Spacer min={8} />
          <DemoHint onPress={paymentsApi.simulateNextFailure}>Demo: simulate a failed payment</DemoHint>
          <Button
            label={tab === 'card' ? `Pay ${formatNaira(c.amountNaira)}` : tab === 'transfer' ? 'I have sent the money' : 'I have paid'}
            disabled={tab === 'ussd' && !ussdBank}
            onPress={pay}
          />
        </>
      )}

      {step === 'usdc' && (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip flex label="In-app wallet" on={source === 'inapp'} onPress={() => setSource('inapp')} />
            <Chip flex label="External wallet" on={source === 'external'} onPress={() => setSource('external')} />
          </View>
          {source === 'inapp' ? (
            <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
              <KeyValue k="Paying from" v="In-app wallet" />
              <KeyValue k="Your balance" v={formatUsdc(balance)} vStyle={{ color: low ? colors.danger : colors.ink }} />
              <KeyValue k="Amount" v={formatUsdc(c.amountUsdc)} />
              <KeyValue k="Network fee" v="Covered by Tedoku" vStyle={{ color: colors.success }} />
              <KeyValue k="Network" v={<Text>Base</Text>} last />
            </Card>
          ) : (
            <Card style={{ gap: 10 }}>
              <Text style={{ lineHeight: 21 }}>Connect the wallet you want to pay from.</Text>
              <SmallButton label="Connect wallet" onPress={() => router.push({ pathname: '/top-up', params: { start: 'connect' } })} />
              <Alert tone="warning">Your wallet address will be visible on-chain as the payer. The in-app wallet is the more private choice.</Alert>
            </Card>
          )}
          {low && wallet.data && (
            <View accessibilityRole="alert" style={{ backgroundColor: colors.dangerSoft, borderWidth: 1.5, borderColor: colors.dangerBorder, borderRadius: 22, padding: 16, gap: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.dangerInk }}>Your balance is too low</Text>
              <Text style={{ fontSize: 13, lineHeight: 19, color: colors.dangerInk }}>
                You need {(c.amountUsdc - balance).toFixed(2)} more USDC. Send USDC on the Base network to your in-app wallet, or pay in naira instead.
              </Text>
              <Mono>{wallet.data.address}</Mono>
              <SmallButton label={copied ? 'Copied' : 'Copy deposit address'} bg="#fff" fg={colors.dangerInk} borderColor={colors.dangerBorder} onPress={() => copy(wallet.data!.address)} />
              <SmallButton label="Top up my wallet" bg={colors.water} fg="#fff" onPress={() => router.push('/top-up')} />
            </View>
          )}
          <Alert tone="info">
            Your USDC goes into an escrow contract. It is released to {d.name.split(' ').slice(0, 2).join(' ')} when you mark the chat complete, and returned to you if they do not respond.{' '}
            <Text style={{ color: colors.muted }}>Sample rate, locked at checkout: {formatNaira(c.nairaPerUsdc)} per USDC.</Text>
          </Alert>
          <Spacer min={8} />
          <DemoHint onPress={paymentsApi.simulateNextFailure}>Demo: simulate a failed payment</DemoHint>
          <Button label={`Pay ${formatUsdc(c.amountUsdc)}`} disabled={low || source === 'external'} onPress={pay} />
        </>
      )}

      {step === 'processing' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: 20, fontWeight: '800' }}>Confirming your payment</Text>
          <Sub style={{ textAlign: 'center', maxWidth: 260, fontSize: 14 }}>This usually takes a few seconds. Please keep the app open.</Sub>
        </View>
      )}

      {step === 'success' && (
        <View style={{ flex: 1, alignItems: 'center', gap: 14, paddingTop: 40 }}>
          <StateIcon name="check" bg={colors.successSoft} color={colors.success} radius={26} />
          <Text style={{ fontSize: 24, fontWeight: '800' }}>Payment received</Text>
          <Text style={{ textAlign: 'center', lineHeight: 21, color: colors.muted, maxWidth: 290 }}>
            {rail === 'usdc' ? `${formatUsdc(c.amountUsdc)} is held in escrow until your chat is complete.` : `${formatNaira(c.amountNaira)} is held safely until your chat is complete.`}
          </Text>
          <Card padded={false} style={{ alignSelf: 'stretch', paddingHorizontal: 16, paddingVertical: 4 }}>
            <KeyValue k="Doctor" v={d.name} />
            <KeyValue k="You appear as" v={alias} />
            <KeyValue k="Paid with" v={rail === 'usdc' ? 'USDC (escrow contract)' : 'Naira'} />
            <KeyValue k="Reference" v={result?.reference ?? '—'} last />
          </Card>
          <Spacer min={8} />
          <Button
            label="Start chat"
            style={{ alignSelf: 'stretch' }}
            onPress={() => router.replace({ pathname: '/chat/[id]', params: { id: result?.consultationId ?? 'c_luna', fresh: '1', rail } })}
          />
        </View>
      )}

      {step === 'failed' && (
        <View style={{ flex: 1, alignItems: 'center', gap: 14, paddingTop: 40 }}>
          <StateIcon name="close" bg={colors.dangerSoft} color={colors.danger} radius={26} />
          <Text style={{ fontSize: 24, fontWeight: '800', textAlign: 'center' }}>Payment did not go through</Text>
          <Text style={{ textAlign: 'center', lineHeight: 21, color: colors.muted, maxWidth: 290 }}>{result?.reason} You have not been charged and your chat has not started.</Text>
          <Spacer min={8} />
          <Button label="Try again" style={{ alignSelf: 'stretch' }} onPress={() => setStep(rail)} />
          <Button label="Choose another way to pay" bg={colors.primaryMist} fg={colors.primaryDeep} style={{ alignSelf: 'stretch' }} onPress={() => setStep('choose')} />
        </View>
      )}
    </Screen>
  );
}

function RadioCard({ on, onPress, title, text, amount }: { on: boolean; onPress: () => void; title: string; text: string; amount: string }) {
  const c = on ? colors.primary : colors.border;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: '#fff', borderWidth: 2, borderColor: c }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: c, backgroundColor: on ? colors.primary : '#fff' }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700' }}>{title}</Text>
        <Sub style={{ fontSize: 12 }}>{text}</Sub>
      </View>
      <Text style={{ fontWeight: '800' }}>{amount}</Text>
    </Pressable>
  );
}

function LabeledField({ label, ...props }: React.ComponentProps<typeof Field> & { label: string }) {
  return (
    <View>
      <Lbl style={{ marginBottom: 6 }}>{label}</Lbl>
      <Field accessibilityLabel={label} {...props} />
    </View>
  );
}

