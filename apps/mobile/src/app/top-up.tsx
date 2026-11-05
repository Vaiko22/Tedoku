import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, formatNaira, platformApi, shortAddress, walletApi, type ExternalWalletOption } from '@tedoku/shared';
import { B, Text } from '@/components/Text';
import { Icon, type IconName } from '@/components/Icon';
import {
  Alert,
  BackButton,
  Button,
  Card,
  Checkbox,
  Chip,
  DemoHint,
  Field,
  KeyValue,
  Lbl,
  Loading,
  Mono,
  Row,
  Screen,
  Spacer,
  StateIcon,
  Sub,
  Tag,
  Title,
} from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useCopy } from '@/lib/clipboard';

type Step = 'home' | 'receive' | 'connect' | 'connecting' | 'network' | 'amount' | 'rejected' | 'success';
/** PLACEHOLDER: read from the connected wallet via WalletConnect / wagmi once integrated. */
const EXTERNAL = { address: '0x7a3f00000000000000000000000000000000c91d', balanceUsdc: 120, network: 'Ethereum' };

/** Top up the in-app USDC wallet: receive to address, or connect an external wallet. */
export default function TopUp() {
  const { start } = useLocalSearchParams<{ start?: Step }>();
  const wallet = useQuery(() => walletApi.me());
  const options = useQuery(() => walletApi.externalOptions());
  const settings = useQuery(() => platformApi.settings());
  const [step, setStep] = useState<Step>(start ?? 'home');
  const [ext, setExt] = useState<ExternalWalletOption | null>(null);
  const [amt, setAmt] = useState('10');
  const [agree, setAgree] = useState(false);
  const [added, setAdded] = useState(0);
  const [busy, setBusy] = useState(false);
  const { copied, copy } = useCopy();

  if (!wallet.data) return <Loading />;
  const w = wallet.data;
  const rate = settings.data?.nairaPerUsdc ?? 1515;
  const n = parseFloat(amt);
  const valid = !isNaN(n) && n > 0;
  const tooMuch = valid && n > EXTERNAL.balanceUsdc;

  const confirm = async () => {
    if (!ext) return;
    setBusy(true);
    try {
      // PLACEHOLDER: ask the external wallet to sign the transfer, then report it to the backend.
      const updated = await walletApi.topUp(n, EXTERNAL.address);
      wallet.setData(updated);
      setAdded(n);
      setAgree(false);
      setStep('success');
    } finally {
      setBusy(false);
    }
  };
  const simulateDeposit = () => {
    wallet.setData({ ...w, balanceUsdc: w.balanceUsdc + 25 });
    setAdded(25);
    setStep('success');
  };

  const head = (title: string, back: () => void = () => setStep('home')) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <BackButton onPress={back} />
      <Title size={22}>{title}</Title>
    </View>
  );
  const walletCard = (right?: React.ReactNode) =>
    ext && (
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <WalletMark ext={ext} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700' }}>
            {ext.name}
            {step === 'network' ? ' connected' : ' · Base'}
          </Text>
          <View style={{ marginTop: 4, alignSelf: 'flex-start' }}>
            <Text style={{ fontFamily: 'Menlo', fontSize: 12, backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' }}>{shortAddress(EXTERNAL.address)}</Text>
          </View>
        </View>
        {right}
      </Card>
    );

  return (
    <Screen>
      {step === 'home' && (
        <>
          {head('Top up wallet', () => (router.canGoBack() ? router.back() : router.navigate('/me')))}
          <LinearGradient colors={[colors.waterDark, colors.water]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 22, padding: 20 }}>
            <Text style={{ fontSize: 13, color: colors.waterOnDark, fontWeight: '600' }}>In-app wallet balance</Text>
            <Text style={{ fontSize: 36, fontWeight: '800', letterSpacing: -0.7, marginTop: 4, color: '#fff' }}>
              {w.balanceUsdc.toFixed(2)} <Text style={{ fontSize: 18 }}>USDC</Text>
            </Text>
            <Text style={{ fontSize: 13, color: colors.waterOnDark, marginTop: 4, lineHeight: 18 }}>
              About {formatNaira(w.balanceUsdc * rate)} at today's sample rate. Network fees on chats are covered by Tedoku.
            </Text>
          </LinearGradient>
          <Lbl>Ways to add USDC</Lbl>
          <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
            <Row onPress={() => setStep('receive')}>
              <IconTile name="receive" bg={colors.waterSoft} color={colors.water} />
              <Item title="Receive USDC" sub="Send from any exchange or wallet to your address" />
            </Row>
            <Row onPress={() => setStep('connect')}>
              <IconTile name="wallet" bg={colors.primarySoft} color={colors.primary} />
              <Item title="Connect an external wallet" sub="MetaMask, Coinbase Wallet or WalletConnect" />
            </Row>
            <Row last style={{ opacity: 0.6 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryMist, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '800', color: colors.muted }}>₦</Text>
              </View>
              <Item title="Buy with naira" sub="Card or bank transfer into USDC" />
              <Tag label="Coming soon" bg={colors.warningSoft} fg={colors.warningInk} />
            </Row>
          </Card>
          <Alert tone="info">You do not need USDC to use Tedoku. You can pay for every chat in naira. Top up only if you prefer paying in USDC.</Alert>
        </>
      )}

      {step === 'receive' && (
        <>
          {head('Receive USDC')}
          <Alert tone="warning" bordered role="alert">
            <B>Send only USDC on the Base network.</B> Anything else, or USDC on another network, may be lost and cannot be recovered.
          </Alert>
          <Card style={{ alignItems: 'center', gap: 12 }}>
            <QrPlaceholder />
            <Sub style={{ textAlign: 'center', fontSize: 12 }}>Scan with your other wallet, or copy the address below.</Sub>
          </Card>
          <View>
            <Lbl style={{ marginBottom: 6 }}>Your in-app wallet address</Lbl>
            <Mono>{w.address}</Mono>
          </View>
          <Button variant="soft" label={copied ? 'Address copied' : 'Copy address'} onPress={() => copy(w.address)} />
          <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
            <KeyValue k="Network" v={w.network} />
            <KeyValue k="Token" v="USDC" />
            <KeyValue k="Arrives in" v="About 1 minute" last />
          </Card>
          <Spacer />
          <DemoHint onPress={simulateDeposit}>Demo: simulate a deposit of 25 USDC</DemoHint>
        </>
      )}

      {step === 'connect' && (
        <>
          {head('Connect a wallet')}
          <Sub style={{ fontSize: 14, lineHeight: 21 }}>Choose the wallet that holds your USDC. We only ask to see your address and to approve one transfer. We never see your keys.</Sub>
          <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
            {(options.data ?? []).map((x, i, all) => (
              <Row
                key={x.id}
                last={i === all.length - 1}
                onPress={() => {
                  // PLACEHOLDER: open the wallet via WalletConnect / the wallet's deep link.
                  setExt(x);
                  setStep('connecting');
                }}
              >
                <WalletMark ext={x} />
                <Item title={x.name} sub={x.note} />
                <Icon name="chevron" color={colors.muted} />
              </Row>
            ))}
          </Card>
          <Alert tone="warning">
            Your wallet address will be visible on-chain as the sender of this top up. The in-app wallet keeps your chats more private, so use a fresh wallet if you want to stay anonymous.
          </Alert>
        </>
      )}

      {step === 'connecting' && ext && (
        <View style={{ flex: 1, alignItems: 'center', gap: 16, paddingTop: 60 }}>
          <WalletMark ext={ext} size={72} />
          <Title size={24} style={{ textAlign: 'center' }}>
            Approve in {ext.name}
          </Title>
          <Sub style={{ fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 290 }}>
            A request is waiting in your wallet app. Approve it to share your address with Tedoku. Nothing is sent yet.
          </Sub>
          <ActivityIndicator color={colors.primary} />
          <Spacer />
          <DemoHint onPress={() => setStep('network')}>Demo: approve in wallet</DemoHint>
          <DemoHint onPress={() => setStep('rejected')}>Demo: reject in wallet</DemoHint>
          <Button variant="ghost" label="Cancel" style={{ alignSelf: 'stretch' }} onPress={() => setStep('connect')} />
        </View>
      )}

      {step === 'rejected' && ext && (
        <>
          {head('Connection cancelled')}
          <Alert tone="danger" bordered role="alert">
            <B>You declined the request in {ext.name}.</B> Nothing was sent and no money moved. You can try again whenever you like.
          </Alert>
          <Sub style={{ fontSize: 14, lineHeight: 21 }}>If the request did not appear, open {ext.name} yourself, check it is unlocked, and try again.</Sub>
          <Spacer />
          <Button label="Try again" onPress={() => setStep('connect')} />
          <Button variant="ghost" label="Receive USDC to my address instead" onPress={() => setStep('receive')} />
        </>
      )}

      {step === 'network' && ext && (
        <>
          {head('Switch network')}
          {walletCard()}
          <Alert tone="warning" bordered role="alert">
            <B>Your wallet is on {EXTERNAL.network}.</B> Tedoku uses USDC on the Base network, where fees are tiny. Switch to Base to continue.
          </Alert>
          <Spacer />
          {/* PLACEHOLDER: request a chain switch from the connected wallet. */}
          <Button label="Switch to Base" onPress={() => setStep('amount')} />
          <Button variant="ghost" label="Cancel" onPress={() => setStep('home')} />
        </>
      )}

      {step === 'amount' && ext && (
        <>
          {head('How much to add')}
          {walletCard(<Tag label="Connected" />)}
          <View>
            <Field
              label="Amount in USDC"
              keyboardType="decimal-pad"
              value={amt}
              onChangeText={(v) => setAmt(v.replace(/[^0-9.]/g, ''))}
              style={{ fontSize: 24, fontWeight: '800', height: 64 }}
            />
            <Sub style={{ marginTop: 6, fontSize: 12 }}>Wallet balance: {EXTERNAL.balanceUsdc.toFixed(2)} USDC</Sub>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['5', '10', '25', '50'].map((v) => (
              <Chip key={v} label={v} flex on={amt === v} onPress={() => setAmt(v)} idleBorder={colors.border} />
            ))}
          </View>
          {tooMuch && (
            <Alert tone="danger" bordered role="alert">
              That is more than the {EXTERNAL.balanceUsdc.toFixed(2)} USDC in your wallet. Enter a smaller amount.
            </Alert>
          )}
          <Card padded={false} style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
            <KeyValue k="You send" v={`${valid ? n.toFixed(2) : '0.00'} USDC`} />
            <KeyValue k="Network fee" v={<Text>About 0.01 USD, from your wallet</Text>} />
            <KeyValue k="Added to Tedoku wallet" v={`${valid ? n.toFixed(2) : '0.00'} USDC`} last />
          </Card>
          <Checkbox checked={agree} onChange={setAgree} label={<Text style={{ fontSize: 13, lineHeight: 19 }}>I understand my wallet address will be visible on-chain as the sender.</Text>} />
          <Spacer />
          <Button label={`Confirm in ${ext.name}`} disabled={!valid || tooMuch || !agree} loading={busy} onPress={confirm} />
        </>
      )}

      {step === 'success' && (
        <View style={{ flex: 1, alignItems: 'center', gap: 14, paddingTop: 50 }}>
          <StateIcon name="check" bg={colors.successSoft} color={colors.success} />
          <Title size={26}>{added.toFixed(2)} USDC added</Title>
          <Sub style={{ fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 300 }}>Your in-app wallet now holds {w.balanceUsdc.toFixed(2)} USDC. You can use it to pay for chats.</Sub>
          <Card padded={false} style={{ alignSelf: 'stretch', paddingHorizontal: 16, paddingVertical: 4 }}>
            <KeyValue k="New balance" v={`${w.balanceUsdc.toFixed(2)} USDC`} />
            <KeyValue k="Network" v={<Text>Base</Text>} />
            <KeyValue k="Receipt" v="View in Receipts" vStyle={{ color: colors.primary }} last />
          </Card>
          <Spacer />
          <Button label="Find a doctor" style={{ alignSelf: 'stretch' }} onPress={() => router.navigate('/doctors')} />
          <Button variant="ghost" label="Back to my profile" style={{ alignSelf: 'stretch' }} onPress={() => router.navigate('/me')} />
        </View>
      )}
    </Screen>
  );
}

function Item({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: '700', fontSize: 15 }}>{title}</Text>
      <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 16 }}>{sub}</Text>
    </View>
  );
}

function IconTile({ name, bg, color }: { name: IconName; bg: string; color: string }) {
  return (
    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} color={color} />
    </View>
  );
}

function WalletMark({ ext, size = 40 }: { ext: ExternalWalletOption; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: ext.color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size > 50 ? 26 : 15 }}>{ext.initial}</Text>
    </View>
  );
}

/**
 * PLACEHOLDER QR pattern, as in the design. Replace with a real QR code of the
 * wallet address (e.g. `react-native-qrcode-svg`) before launch.
 */
function QrPlaceholder() {
  const cells: boolean[] = [];
  let seed = 7;
  for (let r = 0; r < 11; r++)
    for (let c = 0; c < 11; c++) {
      seed = (seed * 31 + 17) % 97;
      const corner = (r < 3 && c < 3) || (r < 3 && c > 7) || (r > 7 && c < 3);
      cells.push(corner || seed % 3 === 0);
    }
  return (
    <View accessibilityRole="image" accessibilityLabel="QR code for your wallet address" style={{ width: 176, height: 176, padding: 8, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, flexDirection: 'row', flexWrap: 'wrap' }}>
      {cells.map((on, i) => (
        <View key={i} style={{ width: `${100 / 11}%`, aspectRatio: 1, padding: 1 }}>
          <View style={{ flex: 1, borderRadius: 1, backgroundColor: on ? colors.ink : '#fff' }} />
        </View>
      ))}
    </View>
  );
}

