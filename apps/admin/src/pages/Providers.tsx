import { useState } from 'react';
import { adminApi, type ProviderRecord, type ProviderStatus } from '@tedoku/shared';
import { PageHeader } from '../components/Layout';
import { Chip, LoadError, Loading, StatusPill, type Tone } from '../components/ui';
import { useQuery } from '../lib/useQuery';

const FILTERS: ('All' | ProviderStatus)[] = ['All', 'Verified', 'Renewal due', 'Suspended'];
const REASONS = ['Complaint upheld', 'License expired', 'Fraud suspected', 'Other'];
const TONE: Record<ProviderStatus, Tone> = { Verified: 'success', 'Renewal due': 'warning', Suspended: 'danger', Revoked: 'neutral' };

type Action = { id: string; kind: 'suspend' | 'revoke' };

export function ProvidersPage() {
  const { data, error, loading, reload, setData } = useQuery(() => adminApi.providers());
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <><PageHeader title="Providers" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Providers" /><LoadError error={error ?? new Error('No data')} retry={reload} /></>;

  const rows = data.filter((r) => (filter === 'All' || r.status === filter) && (r.name + ' ' + r.specialty).toLowerCase().includes(q.toLowerCase()));
  const target = action ? data.find((p) => p.id === action.id) : null;
  const isRevoke = action?.kind === 'revoke';

  const open = (id: string, kind: Action['kind']) => {
    setAction({ id, kind });
    setReason(null);
    setDone(null);
  };
  const close = () => {
    setAction(null);
    setReason(null);
    setDone(null);
  };
  const confirm = async () => {
    if (!action || !reason) return;
    setBusy(true);
    try {
      const updated = await adminApi.providerAction(action.id, action.kind, reason);
      setData(data.map((p) => (p.id === updated.id ? updated : p)));
      setDone(action.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Providers" />
      <div className="page">
        <div className="split">
          <div className="col">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <label htmlFor="pq" className="sr-only">
                Search providers
              </label>
              <input id="pq" className="inp" type="text" placeholder="Search by name or specialty" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 260 }} />
              {FILTERS.map((f) => (
                <Chip key={f} on={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </Chip>
              ))}
            </div>
            <div className="card scroll table-wrap" style={{ padding: '6px 18px' }}>
              <div className="row" style={{ padding: '10px 0', minWidth: 640 }}>
                <span className="lbl" style={{ width: 220 }}>Provider</span>
                <span className="lbl" style={{ width: 170 }}>Specialty</span>
                <span className="lbl" style={{ width: 110 }}>Status</span>
                <span className="lbl" style={{ width: 60 }}>Rating</span>
                <span className="lbl" style={{ flex: 1, textAlign: 'right' }}>Actions</span>
              </div>
              {rows.map((r) => (
                <ProviderRow key={r.id} r={r} onSuspend={() => open(r.id, 'suspend')} onRevoke={() => open(r.id, 'revoke')} />
              ))}
              {rows.length === 0 && <div className="empty">No providers match.</div>}
            </div>
          </div>

          {action && target && (
            <div className="card" style={{ width: 340, flex: 'none', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {done !== action.id ? (
                <>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>
                    {isRevoke ? 'Revoke ' : 'Suspend '}
                    {target.name}?
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
                    {isRevoke
                      ? 'This removes the doctor from search, pauses open chats and tells those patients, and revokes the Verified badge on-chain. They can reapply.'
                      : 'This removes the doctor from search and pauses open chats until you lift the suspension. The Verified badge stays on record.'}
                  </div>
                  <div className="lbl">Reason (required)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {REASONS.map((r) => (
                      <Chip key={r} variant="danger" on={reason === r} onClick={() => setReason(r)}>
                        {r}
                      </Chip>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-danger" style={{ flex: 1 }} disabled={!reason || busy} onClick={confirm}>
                      {isRevoke ? 'Revoke verification' : 'Suspend provider'}
                    </button>
                    <button className="btn btn-soft" onClick={close}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)' }}>Done</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    {target.name} is now{' '}
                    {isRevoke
                      ? 'revoked. The on-chain badge has been updated and affected patients were notified.'
                      : 'suspended and hidden from search. Affected patients were notified.'}
                  </div>
                  <button className="btn btn-soft" onClick={close}>
                    Close
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ProviderRow({ r, onSuspend, onRevoke }: { r: ProviderRecord; onSuspend: () => void; onRevoke: () => void }) {
  const off = r.status === 'Suspended' || r.status === 'Revoked';
  return (
    <div className="row" style={{ minWidth: 640 }}>
      <div style={{ width: 220, fontSize: 14, fontWeight: 700 }}>
        {r.name}
        <div className="sub">{r.role}</div>
      </div>
      <div style={{ width: 170, fontSize: 13 }}>{r.specialty}</div>
      <div style={{ width: 110 }}>
        <StatusPill tone={TONE[r.status]}>{r.status}</StatusPill>
      </div>
      <div style={{ width: 60, fontSize: 13, fontWeight: 700 }}>{r.rating.toFixed(1)}</div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn xs btn-amber-soft" style={{ height: 34, padding: '0 12px', fontSize: 13 }} disabled={off} onClick={onSuspend}>
          Suspend
        </button>
        <button className="btn xs btn-red-soft" style={{ height: 34, padding: '0 12px', fontSize: 13 }} disabled={off} onClick={onRevoke}>
          Revoke
        </button>
      </div>
    </div>
  );
}
