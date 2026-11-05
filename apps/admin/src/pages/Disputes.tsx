import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi, type Dispute } from '@tedoku/shared';
import { PageHeader, useRefreshBadges } from '../components/Layout';
import { DetailRow, LoadError, Loading, StatusPill } from '../components/ui';
import { useQuery } from '../lib/useQuery';

const resultText = (d: Dispute) => {
  const usdc = d.rail === 'usdc';
  if (d.resolution === 'release')
    return usdc
      ? 'Funds released from escrow to the doctor, and the platform fee was split automatically.'
      : 'Payout released to the doctor, minus the platform fee.';
  return usdc
    ? 'Refund sent to the patient from the escrow contract. The doctor has been told.'
    : 'Refund sent to the original payment method. The doctor has been told.';
};

export function DisputesPage() {
  const { data, error, loading, reload, setData } = useQuery(() => adminApi.disputes());
  const refreshBadges = useRefreshBadges();
  const [params, setParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [justResolved, setJustResolved] = useState<Record<string, boolean>>({});

  if (loading && !data) return <><PageHeader title="Disputes" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Disputes" /><LoadError error={error ?? new Error('No data')} retry={reload} /></>;

  const d = data.find((x) => x.id === params.get('id')) ?? data[0];
  if (!d) return <><PageHeader title="Disputes" /><div className="page empty">No disputes.</div></>;
  const open = d.status === 'Open';

  const resolve = async (resolution: 'refund' | 'release') => {
    setBusy(true);
    try {
      const updated = await adminApi.resolveDispute(d.id, resolution);
      setData(data.map((x) => (x.id === d.id ? updated : x)));
      setJustResolved({ ...justResolved, [d.id]: true });
      refreshBadges();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Disputes" />
      <div className="page">
        <div className="split">
          <div className="card scroll" style={{ width: 340, flex: 'none', padding: '8px 14px' }}>
            {data.map((p) => (
              <button key={p.id} onClick={() => setParams({ id: p.id })} className={'row list-btn' + (p.id === d.id ? ' selected' : '')} aria-current={p.id === d.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {p.id} · {p.issue}
                  </div>
                  <div className="sub">
                    {p.patient} with {p.doctor}
                  </div>
                </div>
                <StatusPill tone={p.status === 'Open' ? 'warning' : 'success'}>{p.status}</StatusPill>
              </button>
            ))}
          </div>

          <div className="col">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>
                  {d.id}: {d.issue}
                </div>
                <div className="sub" style={{ fontSize: 13 }}>
                  Opened {d.openedOn}. Admins only see private IDs, never real names.
                </div>
              </div>
              <StatusPill tone={open ? 'warning' : 'success'}>{d.status}</StatusPill>
            </div>
            <div className="hstack">
              <div className="card" style={{ flex: 1 }}>
                <div className="h3">Consultation</div>
                <DetailRow label="Patient" value={d.patient} />
                <DetailRow label="Doctor" value={d.doctor} />
                <DetailRow label="Amount" value={d.amountLabel} />
                <DetailRow label="Paid with" value={d.railLabel} />
                <DetailRow label="Funds" value={!open ? 'Settled' : d.rail === 'usdc' ? 'Held in the escrow contract' : 'Held by the payment gateway'} />
              </div>
              <div className="card" style={{ flex: 1 }}>
                <div className="h3">What happened</div>
                {d.timeline.map((t) => (
                  <div key={t.text} className="row" style={{ padding: '9px 0' }}>
                    <div style={{ flex: 1, fontSize: 13, lineHeight: 1.4 }}>{t.text}</div>
                    <div className="sub">{t.when}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              {open ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--ink-soft)' }}>
                    Funds stay on hold until you decide. Refund returns the payment to the patient. Release pays the doctor and takes the platform fee.
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-danger" disabled={busy} onClick={() => resolve('refund')}>
                      Refund patient
                    </button>
                    <button className="btn btn-success" disabled={busy} onClick={() => resolve('release')}>
                      Release to doctor
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>
                  {justResolved[d.id] ? resultText(d) : 'Resolved earlier. ' + (d.resolution === 'release' ? 'The payout went to the doctor.' : 'The refund went to the original payment method.')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
