import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, providerApi, providerApplicationIssues, type ProviderApplication } from '@tedoku/shared';
import { Text } from '@/components/Text';
import { Icon, type IconName } from '@/components/Icon';
import { BackButton, Button, Card, Chip, ChipGroup, DemoHint, Field, Lbl, Mono, Screen, SmallButton, Spacer, StateIcon, Sub, Title } from '@/components/ui';
import { useQuery } from '@/lib/useQuery';
import { useCopy } from '@/lib/clipboard';

type DocKey = keyof ProviderApplication['documents'];
const DOCS: [DocKey, string, string, IconName][] = [
  ['governmentId', 'Government ID', "Passport, driver's licence or national ID", 'idCard'],
  ['selfie', 'Selfie', 'A clear photo of your face', 'selfie'],
  ['license', 'Professional license', 'A photo or scan of your practising license', 'document'],
];
const ERROR_TEXT: Record<DocKey, string> = {
  license: 'We could not find this license number on the council register. Check the number, then upload a clear photo of your license.',
  governmentId: 'We could not read this ID. Upload a clear, well-lit photo of the whole card.',
  selfie: 'We could not match this selfie to your ID. Take a new photo in good light.',
};

/** Doctor application: 1 account, 2 practice, 3 documents, 4 payout, 5 wallet, 6 submitted, 7 failed. */
export default function ProviderApply() {
  const { start } = useLocalSearchParams<{ start?: string }>();
  const insets = useSafeAreaInsets();
  const professions = useQuery(() => providerApi.professions());
  const { copied, copy } = useCopy();
  const [step, setStep] = useState(start === 'failed' ? 7 : 1);
  const [busy, setBusy] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [docError, setDocError] = useState<DocKey | null>(null);
  const [app, setApp] = useState<ProviderApplication>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    profession: 'Doctor',
    specialty: 'Gynaecology',
    licenseNumber: '',
    council: '',
    documents: { governmentId: false, selfie: false, license: false },
    payout: 'bank',
    bankName: '',
    accountNumber: '',
  });
  const set = (patch: Partial<ProviderApplication>) => setApp({ ...app, ...patch });
  const specs = professions.data?.find((p) => p.id === app.profession)?.specialties ?? [];
  const bankOnly = app.payout === 'bank';
  const total = bankOnly ? 4 : 5;
  const allUp = app.documents.governmentId && app.documents.selfie && app.documents.license && !docError;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await providerApi.apply(app);
      setWallet(res.payoutWallet ?? null);
      setStep(bankOnly ? 6 : 5);
    } finally {
      setBusy(false);
    }
  };
  const next = () => {
    if (step === 4) return void submit();
    setStep(Math.min(6, step + 1));
  };
  const back = () => setStep(step === 6 && bankOnly ? 4 : step === 7 ? 6 : step - 1);
  // PLACEHOLDER: open the camera / document picker (expo-image-picker) and upload the file.
  const tapDoc = (k: DocKey) => {
    if (docError === k) {
      setDocError(null);
      set({ documents: { ...app.documents, [k]: true } });
    } else set({ documents: { ...app.documents, [k]: !app.documents[k] } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton label={step === 1 ? 'Back to Tedoku' : 'Back'} onPress={step === 1 ? undefined : back} />
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
          <View style={{ height: '100%', borderRadius: 3, backgroundColor: colors.primary, width: `${Math.min(100, (step / 6) * 100)}%` }} />
        </View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.muted }}>{step === 7 ? 'Action needed' : step < 6 ? `Step ${step} of ${total}` : 'Done'}</Text>
      </View>

      <Screen padH={24} padTop={0} gap={0} contentStyle={{ paddingTop: 16 }} header={null}>
        {step === 1 && (
          <>
            <Lbl color={colors.primary}>For doctors and health professionals</Lbl>
            <H2>Join as a verified provider</H2>
            <P>Patients trust Tedoku because every provider is checked. It takes a few minutes.</P>
            <View style={{ gap: 14 }}>
              <Field label="Full name (as on your license)" autoComplete="name" value={app.fullName} onChangeText={(v) => set({ fullName: v })} />
              <Field label="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={app.email} onChangeText={(v) => set({ email: v })} />
              <Field label="Phone number" keyboardType="phone-pad" autoComplete="tel" value={app.phone} onChangeText={(v) => set({ phone: v })} />
              <Field label="Create a password" secureTextEntry autoComplete="new-password" value={app.password} onChangeText={(v) => set({ password: v })} />
            </View>
            <Spacer min={20} />
            <Button label="Continue" disabled={!app.fullName.trim() || !app.email.trim() || app.password.length < 8} onPress={next} />
          </>
        )}

        {step === 2 && (
          <>
            <H2>Your practice</H2>
            <P>Tell us what you do and where you are licensed.</P>
            <Lbl style={{ marginBottom: 8 }}>Profession</Lbl>
            <ChipGroup>
              {(professions.data ?? []).map((p) => (
                <Chip key={p.id} label={p.label} on={app.profession === p.id} onPress={() => set({ profession: p.id, specialty: p.specialties[0] ?? '' })} />
              ))}
            </ChipGroup>
            <Lbl style={{ marginTop: 18, marginBottom: 8 }}>Specialty</Lbl>
            <ChipGroup>
              {specs.map((s) => (
                <Chip key={s} label={s} on={app.specialty === s} onPress={() => set({ specialty: s })} />
              ))}
            </ChipGroup>
            <View style={{ gap: 14, marginTop: 18 }}>
              <Field label="License number" autoCapitalize="characters" value={app.licenseNumber} onChangeText={(v) => set({ licenseNumber: v })} />
              <Field label="Issuing council" placeholder="e.g. Medical and Dental Council of Nigeria" value={app.council} onChangeText={(v) => set({ council: v })} />
            </View>
            <Spacer min={20} />
            <Button label="Continue" disabled={!app.licenseNumber.trim()} onPress={next} />
          </>
        )}

        {step === 3 && (
          <>
            <H2>Verify who you are</H2>
            <P>We check every provider against the official council register before they can chat with patients.</P>
            {docError && (
              <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: 14, backgroundColor: colors.dangerSoft, borderWidth: 1.5, borderColor: colors.dangerBorder, marginBottom: 12 }}>
                <Icon name="info" size={18} color={colors.dangerInk} />
                <Text style={{ flex: 1, fontWeight: '600', lineHeight: 20, color: colors.dangerInk }}>We need you to fix 1 thing before you can continue.</Text>
              </View>
            )}
            <View style={{ gap: 12 }}>
              {DOCS.map(([k, title, hint, icon]) => {
                const bad = docError === k;
                const ok = app.documents[k] && !bad;
                const tone = bad ? colors.danger : ok ? colors.success : colors.primary;
                return (
                  <Pressable
                    key={k}
                    accessibilityRole="button"
                    onPress={() => tapDoc(k)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1.5, borderColor: bad ? colors.danger : ok ? colors.success : colors.border }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: bad ? colors.dangerSoft : ok ? colors.successSoft : colors.primarySoft }}>
                      <Icon name={icon} color={tone} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700' }}>{title}</Text>
                      <Text style={{ fontSize: 12, lineHeight: 17, color: bad ? colors.danger : colors.muted, fontWeight: bad ? '600' : '400' }}>{bad ? ERROR_TEXT[k] : hint}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: tone }}>{bad ? 'Needs attention' : ok ? 'Uploaded' : 'Tap to upload'}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Icon name="lock" size={18} color={colors.muted} />
              <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: colors.muted }}>Documents are encrypted and only seen by the Tedoku review team.</Text>
            </View>
            <View style={{ marginTop: 12 }}>
              <DemoHint
                onPress={() => {
                  setDocError('license');
                  set({ documents: { ...app.documents, license: true } });
                }}
              >
                Demo: show an invalid license error
              </DemoHint>
            </View>
            <Spacer min={20} />
            <Button label="Continue" disabled={!allUp} onPress={next} />
          </>
        )}

        {step === 4 && (
          <>
            <H2>How you get paid</H2>
            <P>Patients can pay in naira or USDC. You are paid in the currency they choose.</P>
            <ChipGroup>
              {(
                [
                  ['bank', 'Naira bank account'],
                  ['usdc', 'USDC wallet'],
                  ['both', 'Both'],
                ] as const
              ).map(([id, label]) => (
                <Chip key={id} label={label} on={app.payout === id} onPress={() => set({ payout: id })} />
              ))}
            </ChipGroup>
            <View style={{ gap: 14, marginTop: 18 }}>
              {app.payout !== 'usdc' && (
                <>
                  <Field label="Bank name" value={app.bankName} onChangeText={(v) => set({ bankName: v })} />
                  <Field label="Account number" keyboardType="number-pad" value={app.accountNumber} onChangeText={(v) => set({ accountNumber: v.replace(/\D/g, '') })} />
                </>
              )}
              {app.payout !== 'bank' && (
                <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.primarySoft }}>
                  <Icon name="info" size={18} color={colors.primaryDeep} />
                  <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: colors.primaryDeep }}>
                    We will create a secure Tedoku payout wallet for you in the next step. You do not need your own wallet.
                  </Text>
                </View>
              )}
              <Field
                label="Consultation fee (₦)"
                keyboardType="number-pad"
                placeholder="Set your price"
                value={app.feeNaira ? String(app.feeNaira) : ''}
                onChangeText={(v) => set({ feeNaira: Number(v.replace(/\D/g, '')) || undefined })}
              />
            </View>
            <Spacer min={20} />
            <Button label={bankOnly ? 'Submit application' : 'Continue'} loading={busy} onPress={next} />
          </>
        )}

        {step === 5 && (
          <>
            <H2>Your Tedoku payout wallet</H2>
            <P>We created this wallet for you. USDC payments from patients arrive here after each completed consultation.</P>
            <Card style={{ padding: 18, gap: 12 }}>
              <Lbl>USDC on Base network</Lbl>
              <Mono size={14}>{wallet ?? '—'}</Mono>
              <SmallButton label={copied ? 'Copied' : 'Copy address'} onPress={() => wallet && copy(wallet)} />
              <Sub style={{ fontSize: 11 }}>Example address shown for this mockup.</Sub>
            </Card>
            <View style={{ gap: 12, marginTop: 18 }}>
              <Bullet icon="lock">Linked to your provider account. You cannot enter a different address here.</Bullet>
              <Bullet icon="info">Receives USDC only. Please do not send other tokens to it.</Bullet>
              <Bullet icon="wallet">You manage and withdraw your earnings from your provider dashboard.</Bullet>
            </View>
            <Spacer min={20} />
            <Button label="Submit application" onPress={() => setStep(6)} />
          </>
        )}

        {step === 6 && (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ marginTop: 8 }}>
              <StateIcon name="check" bg={colors.successSoft} color={colors.success} size={72} radius={24} />
            </View>
            <H2 center>Application submitted</H2>
            <P center>Thank you. We will email you as soon as there is an update.</P>
            <Card style={{ alignSelf: 'stretch', padding: 18, gap: 18 }}>
              {[
                ['Application submitted', 'We have your details and documents.', 'done'],
                ['Under review', 'Our team checks your license against the official council register.', 'current'],
                ['Verified badge issued', 'Your badge is recorded on-chain, so patients can check it.', 'todo'],
              ].map(([title, text, state], i) => (
                <View key={title} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      backgroundColor: state === 'done' ? colors.success : '#fff',
                      borderColor: state === 'done' ? colors.success : state === 'current' ? colors.primary : colors.borderStrong,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '800', color: state === 'done' ? '#fff' : state === 'current' ? colors.primary : colors.muted }}>{state === 'done' ? '✓' : i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700' }}>{title}</Text>
                    <Text style={{ fontSize: 13, lineHeight: 19, color: colors.muted }}>{text}</Text>
                  </View>
                </View>
              ))}
            </Card>
            <Spacer min={20} />
            <DemoHint onPress={() => setStep(7)}>Demo: see what happens if verification fails</DemoHint>
            <Button label="Back to Tedoku" style={{ alignSelf: 'stretch', marginTop: 12 }} onPress={() => router.replace('/welcome')} />
          </View>
        )}

        {step === 7 && (
          <>
            <View style={{ marginTop: 8 }}>
              <StateIcon name="info" bg={colors.dangerSoft} color={colors.danger} size={72} radius={24} />
            </View>
            <H2 center>We could not verify your license</H2>
            <P center>Your account is on hold. You cannot receive patients until this is fixed.</P>
            <Card padded={false} style={{ paddingHorizontal: 18, paddingVertical: 6 }}>
              {providerApplicationIssues.map((x, i) => (
                <View key={x.title} style={{ paddingVertical: 14, borderBottomWidth: i === providerApplicationIssues.length - 1 ? 0 : 1, borderBottomColor: colors.divider }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.danger }}>{x.title}</Text>
                  <Text style={{ fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 2 }}>{x.detail}</Text>
                </View>
              ))}
            </Card>
            <Spacer min={20} />
            <Button
              label="Fix and resubmit"
              onPress={() => {
                setDocError('license');
                set({ documents: { governmentId: true, selfie: true, license: true } });
                setStep(3);
              }}
            />
            {/* PLACEHOLDER: support channel (email, WhatsApp or in-app chat). */}
            <Button variant="ghost" label="Contact support" onPress={() => {}} />
          </>
        )}
      </Screen>
    </View>
  );
}

function H2({ children, center }: { children: string; center?: boolean }) {
  return (
    <Title style={{ marginTop: center ? 18 : 8, marginBottom: 10, textAlign: center ? 'center' : 'left' }}>
      {children}
    </Title>
  );
}

function P({ children, center }: { children: string; center?: boolean }) {
  return <Text style={{ marginBottom: 20, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: center ? 'center' : 'left', maxWidth: center ? 300 : undefined, alignSelf: center ? 'center' : 'auto' }}>{children}</Text>;
}

function Bullet({ icon, children }: { icon: IconName; children: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Icon name={icon} size={18} color={colors.primary} />
      <Text style={{ flex: 1, lineHeight: 20 }}>{children}</Text>
    </View>
  );
}
