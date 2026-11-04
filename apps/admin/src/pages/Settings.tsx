import { adminApi, type AdminSettings } from '@tedoku/shared';
import { PageHeader } from '../components/Layout';
import { Chip, LoadError, Loading, Switch } from '../components/ui';
import { useQuery } from '../lib/useQuery';

/**
 * Everything on this page is read by the mobile app through `platformApi.settings()`:
 * the fee shown to doctors, which payment rails patients can pick, and the dispute
 * and response windows.
 */
export function SettingsPage() {
  const s = useQuery(() => adminApi.settings());
  const log = useQuery(() => adminApi.changeLog());
  const windows = useQuery(() => adminApi.disputeWindowOptions());
  const replies = useQuery(() => adminApi.responseTimeOptions());

  if (s.loading && !s.data) return <><PageHeader title="Settings" /><Loading /></>;
  if (s.error || !s.data) return <><PageHeader title="Settings" /><LoadError error={s.error ?? new Error('No data')} retry={s.reload} /></>;
  const settings = s.data;

  const update = async (patch: Partial<AdminSettings>) => {
    s.setData({ ...settings, ...patch }); // optimistic
    try {
      s.setData(await adminApi.updateSettings(patch));
      void log.reload();
    } catch {
      void s.reload();
    }
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="page">
        <div className="split">
          <div className="col">
            <div className="card">
              <div className="h3">Platform fee</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <StepButton label="Lower fee" onClick={() => update({ feePercent: Math.max(0, settings.feePercent - 1) })}>
                  −
                </StepButton>
                <div style={{ fontSize: 30, fontWeight: 800, minWidth: 80, textAlign: 'center' }} aria-live="polite">
                  {settings.feePercent}%
                </div>
                <StepButton label="Raise fee" onClick={() => update({ feePercent: Math.min(settings.feeCapPercent, settings.feePercent + 1) })}>
                  +
                </StepButton>
              </div>
              <div className="sub" style={{ marginTop: 10 }}>
                Introductory rate is 10%. The fee is capped at {settings.feeCapPercent}%, applies to new consultations only, and every change is logged.
              </div>
            </div>
            <div className="card">
              <div className="h3">Payment rails</div>
              <div className="row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Naira (card, bank transfer, USSD)</div>
                  <div className="sub">Paid through the Nigerian payment gateway</div>
                </div>
                <Switch label="Naira payments" on={settings.nairaEnabled} onChange={(v) => update({ nairaEnabled: v })} />
              </div>
              <div className="row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>USDC (escrow contract)</div>
                  <div className="sub">Network fees are sponsored for patients</div>
                </div>
                <Switch label="USDC payments" on={settings.usdcEnabled} onChange={(v) => update({ usdcEnabled: v })} />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card">
              <div className="h3">Rules</div>
              <div className="lbl" style={{ marginBottom: 6 }}>
                Dispute window after a chat
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {(windows.data ?? []).map((w) => (
                  <Chip key={w} on={settings.disputeWindow === w} onClick={() => update({ disputeWindow: w })}>
                    {w}
                  </Chip>
                ))}
              </div>
              <div className="lbl" style={{ marginBottom: 6 }}>
                Doctor response time before auto-refund
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(replies.data ?? []).map((w) => (
                  <Chip key={w} on={settings.responseTime === w} onClick={() => update({ responseTime: w })}>
                    {w}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="h3">Change log</div>
              {(log.data ?? []).map((l) => (
                <div key={l.text + l.when} className="row">
                  <div style={{ flex: 1, fontSize: 13 }}>{l.text}</div>
                  <div className="sub">{l.when}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-mist)', fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}
    >
      {children}
    </button>
  );
}
