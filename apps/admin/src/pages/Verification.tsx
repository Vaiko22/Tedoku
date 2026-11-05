import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi, initialsOf, type ApplicationDecision, type ApplicationReview } from '@tedoku/shared';
import { PageHeader, useRefreshBadges } from '../components/Layout';
import { Chip, DetailRow, LoadError, Loading, StatusPill, type Tone } from '../components/ui';
import { useQuery } from '../lib/useQuery';

const REJECT_REASONS = ['License not found', 'ID does not match', 'Photo unreadable', 'Other'];
const CHECKS = [
  ['id', 'Government ID matches the applicant'],
  ['lic', 'License document matches the details'],
  ['reg', 'Number found on the council register'],
] as const;
/** PLACEHOLDER: link to the council's public register lookup. */
const MDCN_REGISTER_URL = '#';

const statusOf = (d: ApplicationDecision | null): [string, Tone] =>
  !d ? ['Pending', 'neutral'] : d.kind === 'approved' ? ['Approved', 'success'] : d.kind === 'rejected' ? ['Rejected', 'danger'] : ['Info asked', 'warning'];

export function VerificationPage() {
  const { data, error, loading, reload, setData } = useQuery(() => adminApi.applications());
  const refreshBadges = useRefreshBadges();
  const [params, setParams] = useSearchParams();
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <><PageHeader title="Verification queue" /><Loading /></>;
  if (error || !data) return <><PageHeader title="Verification queue" /><LoadError error={error ?? new Error('No data')} retry={reload} /></>;

  const selId = params.get('id') ?? data[0]?.id;
  const a = data.find((x) => x.id === selId) ?? data[0];
  if (!a) return <><PageHeader title="Verification queue" /><div className="page empty">No applications waiting.</div></>;

  const myChecks = checks[a.id] ?? {};
  const myReason = reasons[a.id] ?? null;
  const [status, tone] = statusOf(a.decision);

  const decide = async (decision: ApplicationDecision | null) => {
    setBusy(true);
    try {
      const updated = await adminApi.decide(a.id, decision);
      setData(data.map((x) => (x.id === a.id ? updated : x)));
      refreshBadges();
    } finally {
      setBusy(false);
    }
  };

  const banner: Record<ApplicationDecision['kind'], [string, string]> = {
    approved: ['Approved. The Verified badge is being recorded on-chain and the doctor has been emailed.', 'var(--success)'],
    rejected: [`Rejected: ${a.decision?.kind === 'rejected' ? a.decision.reason : ''}. The doctor can fix and resubmit.`, 'var(--danger-deep)'],
    info: ['More information requested. The doctor has been emailed.', 'var(--warning-ink)'],
  };

  return (
    <>
      <PageHeader title="Verification queue" />
      <div className="page">
        <div className="split">
          <div className="card scroll" style={{ width: 330, flex: 'none', padding: '8px 14px' }}>
            {data.map((p) => (
              <ListItem key={p.id} app={p} selected={p.id === a.id} onPick={() => setParams({ id: p.id })} />
            ))}
          </div>

          <div className="col scroll">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{a.name}</div>
                <div className="sub" style={{ fontSize: 13 }}>
                  {a.role} · submitted {a.submittedOn}
                </div>
              </div>
              <StatusPill tone={tone}>{status}</StatusPill>
            </div>

            <div className="hstack">
              <div className="card" style={{ flex: 1 }}>
                <div className="h3">Submitted details</div>
                <DetailRow labelWidth={110} label="License" value={a.license} />
                <DetailRow labelWidth={110} label="Council" value={a.council} />
                <DetailRow labelWidth={110} label="Email" value={a.email} />
                <DetailRow labelWidth={110} label="Phone" value={a.phone} />
                <DetailRow labelWidth={110} label="Payout" value={a.payout} />
              </div>
              <div className="card" style={{ flex: 1 }}>
                <div className="h3">Automated checks</div>
                {a.autoChecks.map((c) => (
                  <div key={c.label} className="row" style={{ padding: '9px 0', alignItems: 'flex-start' }}>
                    <StatusPill tone={c.passed ? 'success' : 'danger'} style={{ flex: 'none' }}>
                      {c.passed ? 'Pass' : 'Fail'}
                    </StatusPill>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                      <b>{c.label}</b>
                      <div className="sub">{c.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hstack">
              <div className="card" style={{ flex: 1 }}>
                <div className="h3">Documents</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {a.documents.map((d) => (
                    <a
                      key={d.label}
                      href={d.url ?? '#'}
                      target={d.url ? '_blank' : undefined}
                      rel="noreferrer"
                      style={{ flex: 1, border: '1.5px dashed var(--border-strong)', borderRadius: 12, padding: '14px 8px', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{d.label}</div>
                      <div className="sub" style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 4 }}>
                        Open
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              <div className="card" style={{ flex: 1 }}>
                <div className="h3">Manual checklist</div>
                {CHECKS.map(([k, label]) => (
                  <label key={k} htmlFor={`c-${k}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 14, fontWeight: 600 }}>
                    <input
                      id={`c-${k}`}
                      type="checkbox"
                      checked={!!myChecks[k]}
                      onChange={() => setChecks({ ...checks, [a.id]: { ...myChecks, [k]: !myChecks[k] } })}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                    />
                    {label}
                  </label>
                ))}
                <a href={MDCN_REGISTER_URL} target="_blank" rel="noreferrer" className="link" style={{ display: 'inline-block', marginTop: 6 }}>
                  Open the MDCN register
                </a>
              </div>
            </div>

            <div className="card">
              {!a.decision ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="lbl">Reject reason</span>
                    {REJECT_REASONS.map((r) => (
                      <Chip key={r} variant="danger" on={myReason === r} onClick={() => setReasons({ ...reasons, [a.id]: r })}>
                        {r}
                      </Chip>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-success" disabled={busy || !(myChecks.id && myChecks.lic && myChecks.reg)} onClick={() => decide({ kind: 'approved' })}>
                      Approve and issue badge
                    </button>
                    <button className="btn btn-warning" disabled={busy} onClick={() => decide({ kind: 'info' })}>
                      Request more info
                    </button>
                    <button className="btn btn-danger" disabled={busy || !myReason} onClick={() => myReason && decide({ kind: 'rejected', reason: myReason })}>
                      Reject application
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: banner[a.decision.kind][1] }}>{banner[a.decision.kind][0]}</div>
                  <button className="link underline" disabled={busy} onClick={() => decide(null)}>
                    Change decision
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ListItem({ app, selected, onPick }: { app: ApplicationReview; selected: boolean; onPick: () => void }) {
  const [status, tone] = statusOf(app.decision);
  return (
    <button onClick={onPick} className={'row list-btn' + (selected ? ' selected' : '')} aria-current={selected}>
      <div className="avatar">{initialsOf(app.name)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{app.name}</div>
        <div className="sub">{app.role}</div>
      </div>
      <StatusPill tone={tone}>{status}</StatusPill>
    </button>
  );
}
