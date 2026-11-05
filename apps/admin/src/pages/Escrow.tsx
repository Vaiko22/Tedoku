import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi, formatAmount, type EscrowItem, type EscrowStatus, type PayoutStatus } from '@tedoku/shared';
import { PageHeader, useRefreshBadges } from '../components/Layout';
import { Chip, LoadError, Loading, StatusPill, Switch, type Tone } from '../components/ui';
import { useQuery } from '../lib/useQuery';

type Tab = 'holdings' | 'payouts' | 'controls';
const TABS: [Tab, string][] = [
  ['holdings', 'Holdings'],
  ['payouts', 'Payouts and reconciliation'],
  ['controls', 'Contract and controls'],
];

export function EscrowPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'holdings';
  return (
    <>
      <PageHeader title="Escrow" />
      <div className="page" style={{ gap: 14, paddingBottom: 24 }}>
        <div className="segmented" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setParams({ tab: id })}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'holdings' && <Holdings />}
        {tab === 'payouts' && <Payouts />}
        {tab === 'controls' && <Controls />}
      </div>
    </>
  );
}

// ------------------------------------------------------------------ Holdings

const LABEL: Record<EscrowStatus, [string, Tone]> = {
  held: ['Chat in progress', 'info'],
  window: ['Dispute window', 'warning'],
  on_hold: ['On hold', 'danger'],
  released: ['Released', 'success'],
  refunded: ['Refunded', 'neutral'],
};
type Filter = 'all' | 'held' | 'window' | 'on_hold' | 'final';
const FILTERS: [Filter, string][] = [
  ['all', 'All'],
  ['held', 'Chat in progress'],
  ['window', 'Dispute window'],
  ['on_hold', 'On hold'],
  ['final', 'Released or refunded'],
];
type Act = 'release' | 'refund' | 'hold';
const REASONS: Record<Act, string[]> = {
  release: ['Chat completed', 'Dispute resolved for the doctor', 'Patient confirmed'],
  refund: ['Doctor did not respond', 'Dispute resolved for the patient', 'Duplicate payment'],
  hold: ['Dispute opened', 'Fraud suspected', 'Needs review'],
};
const isFinal = (s: EscrowStatus) => s === 'released' || s === 'refunded';

function Holdings() {
  const items = useQuery(() => adminApi.escrow());
  const audit = useQuery(() => adminApi.escrowAudit());
  const me = useQuery(() => adminApi.me());
  const settings = useQuery(() => adminApi.settings());
  const refreshBadges = useRefreshBadges();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');
  const [act, setAct] = useState<Act | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (items.loading && !items.data) return <Loading />;
  if (items.error || !items.data) return <LoadError error={items.error ?? new Error('No data')} retry={items.reload} />;
  const all = items.data;
  const feePct = settings.data?.feePercent ?? 10;

  const rows = all.filter((i) => filter === 'all' || (filter === 'final' ? isFinal(i.status) : i.status === filter));
  const cur = all.find((i) => i.id === params.get('sel')) ?? all[0]!;
  const heldN = all.filter((i) => i.rail === 'naira' && !isFinal(i.status)).reduce((a, i) => a + i.gross, 0);
  const heldU = all.filter((i) => i.rail === 'usdc' && !isFinal(i.status)).reduce((a, i) => a + i.gross, 0);
  const fee = (cur.gross * feePct) / 100;
  const [label, tone] = LABEL[cur.status];

  const pick = (id: string) => {
    setParams({ tab: 'holdings', sel: id });
    setAct(null);
    setReason(null);
  };
  const confirm = async () => {
    if (!act || !reason) return;
    setBusy(true);
    try {
      const updated = await adminApi.escrowAction(cur.id, act, reason, me.data?.name ?? 'admin');
      items.setData(all.map((i) => (i.id === updated.id ? updated : i)));
      setAct(null);
      setReason(null);
      void audit.reload();
      refreshBadges();
    } finally {
      setBusy(false);
    }
  };

  const kpis = [
    { label: 'Held in escrow, naira', value: formatAmount(heldN, 'naira'), sub: 'Held by the payment gateway' },
    { label: 'Held in escrow, USDC', value: formatAmount(heldU, 'usdc'), sub: 'In the escrow contract' },
    { label: 'Releasing within 24 h', value: String(all.filter((i) => i.status === 'window').length), sub: 'Dispute window ending' },
    { label: 'On hold', value: String(all.filter((i) => i.status === 'on_hold').length), sub: 'Open disputes' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ padding: '14px 16px' }}>
            <div className="lbl">{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>{k.value}</div>
            <div className="sub">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="split" style={{ gap: 16 }}>
        <div style={{ flex: 1.7, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map(([id, l]) => (
              <Chip key={id} on={filter === id} onClick={() => setFilter(id)}>
                {l}
              </Chip>
            ))}
          </div>
          <div className="card scroll table-wrap" style={{ padding: '4px 16px', flex: 1 }}>
            <div className="row" style={{ padding: '9px 0', minWidth: 560 }}>
              <span className="lbl" style={{ width: 64 }}>ID</span>
              <span className="lbl" style={{ flex: 1 }}>Patient and doctor</span>
              <span className="lbl" style={{ width: 100, textAlign: 'right' }}>Amount</span>
              <span className="lbl" style={{ width: 62, textAlign: 'center' }}>Rail</span>
              <span className="lbl" style={{ width: 112, textAlign: 'right' }}>Status</span>
            </div>
            {rows.map((i) => (
              <HoldingRow key={i.id} i={i} selected={i.id === cur.id} onPick={() => pick(i.id)} />
            ))}
            {rows.length === 0 && <div className="empty">Nothing here.</div>}
          </div>
        </div>

        <div className="card scroll" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{cur.id}</div>
            <StatusPill tone={tone}>{label}</StatusPill>
          </div>
          <Line label="Patient" value={cur.patient} />
          <Line label="Doctor" value={cur.doctor} />
          <Line label="Paid amount" value={formatAmount(cur.gross, cur.rail)} />
          <Line label={`Platform fee (${feePct}%)`} value={formatAmount(fee, cur.rail)} />
          <Line label="Doctor share" value={formatAmount(cur.gross - fee, cur.rail)} />
          <div className="sub">
            {cur.rail === 'usdc' ? 'The funds sit in the escrow contract.' : 'The funds are held by the payment gateway.'} {cur.note}
          </div>

          {!isFinal(cur.status) &&
            (!act ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn sm btn-success" onClick={() => setAct('release')}>
                  Release to doctor
                </button>
                <button className="btn sm btn-danger" onClick={() => setAct('refund')}>
                  Refund patient
                </button>
                {cur.status !== 'on_hold' && (
                  <button className="btn sm btn-warning" onClick={() => setAct('hold')}>
                    Place on hold
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="lbl">Reason for {act} (required)</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {REASONS[act].map((r) => (
                    <Chip key={r} variant="dark" on={reason === r} onClick={() => setReason(r)}>
                      {r}
                    </Chip>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn sm btn-dark" style={{ flex: 1 }} disabled={!reason || busy} onClick={confirm}>
                    Confirm {act}
                  </button>
                  <button className="btn sm btn-soft" onClick={() => (setAct(null), setReason(null))}>
                    Cancel
                  </button>
                </div>
              </div>
            ))}

          <div className="lbl" style={{ marginTop: 4 }}>
            Audit trail
          </div>
          {(audit.data ?? []).slice(0, 3).map((l) => (
            <div key={l.text} className="row xtight">
              <div style={{ flex: 1, fontSize: 12, lineHeight: 1.4 }}>{l.text}</div>
              <div className="sub">{l.when}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HoldingRow({ i, selected, onPick }: { i: EscrowItem; selected: boolean; onPick: () => void }) {
  const [label, tone] = LABEL[i.status];
  return (
    <button onClick={onPick} className={'row list-btn' + (selected ? ' selected' : '')} style={{ padding: '10px 6px', borderRadius: 8, minWidth: 560 }} aria-current={selected}>
      <span style={{ width: 64, fontSize: 12, fontWeight: 700 }}>{i.id}</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
        <b>{i.patient}</b> with {i.doctor}
      </span>
      <span style={{ width: 100, textAlign: 'right', fontSize: 13, fontWeight: 800 }}>{formatAmount(i.gross, i.rail)}</span>
      <span style={{ width: 62, textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{i.rail === 'naira' ? 'Naira' : 'USDC'}</span>
      <span style={{ width: 112, textAlign: 'right' }}>
        <StatusPill tone={tone}>{label}</StatusPill>
      </span>
    </button>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="row xtight">
      <span className="sub">{label}</span>
      <b style={{ fontSize: 13, marginLeft: 'auto' }}>{value}</b>
    </div>
  );
}

// ------------------------------------------------------------------ Payouts

const PAYOUT_TONE: Record<PayoutStatus, Tone> = { Paid: 'success', Pending: 'info', Failed: 'danger', Flagged: 'warning' };

function Payouts() {
  const pays = useQuery(() => adminApi.payouts());
  const [checking, setChecking] = useState(false);
  const recon = useQuery(() => adminApi.reconciliation());

  const act = async (id: string, action: 'retry' | 'flag') => {
    const updated = await adminApi.payoutAction(id, action);
    pays.setData((pays.data ?? []).map((p) => (p.id === id ? updated : p)));
  };
  const runCheck = async () => {
    setChecking(true);
    try {
      recon.setData(await adminApi.reconciliation(true));
    } finally {
      setChecking(false);
    }
  };

  if (pays.loading && !pays.data) return <Loading />;
  if (pays.error || !pays.data) return <LoadError error={pays.error ?? new Error('No data')} retry={pays.reload} />;
  const checkedAt = recon.data?.[0]?.checkedAt;

  return (
    <div className="split" style={{ gap: 16 }}>
      <div className="card scroll table-wrap" style={{ flex: 1.7, minWidth: 0, padding: '4px 16px' }}>
        <div className="h3" style={{ paddingTop: 14, margin: 0 }}>
          Doctor payouts
        </div>
        <div className="row" style={{ padding: '9px 0', minWidth: 560 }}>
          <span className="lbl" style={{ width: 60 }}>ID</span>
          <span className="lbl" style={{ flex: 1 }}>Doctor and destination</span>
          <span className="lbl" style={{ width: 100, textAlign: 'right' }}>Amount</span>
          <span className="lbl" style={{ width: 84, textAlign: 'center' }}>Status</span>
          <span className="lbl" style={{ width: 120, textAlign: 'right' }}>Action</span>
        </div>
        {pays.data.map((p) => (
          <div key={p.id} className="row" style={{ alignItems: 'flex-start', minWidth: 560 }}>
            <span style={{ width: 60, fontSize: 12, fontWeight: 700, paddingTop: 2 }}>{p.id}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
              <b>{p.doctor}</b>
              <div className="sub">{p.destination}</div>
              {p.status === 'Failed' && p.note && (
                <div className="sub" style={{ color: 'var(--danger-deep)', fontWeight: 600 }}>
                  {p.note}
                </div>
              )}
            </span>
            <span style={{ width: 100, textAlign: 'right', fontSize: 13, fontWeight: 800 }}>{formatAmount(p.amount, p.rail)}</span>
            <span style={{ width: 84, textAlign: 'center' }}>
              <StatusPill tone={PAYOUT_TONE[p.status]}>{p.status}</StatusPill>
            </span>
            <span style={{ width: 120, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              {p.status === 'Failed' && (
                <>
                  <button className="btn xs" style={{ background: 'var(--primary-soft)', color: 'var(--primary-deep)' }} onClick={() => act(p.id, 'retry')}>
                    Retry
                  </button>
                  <button className="btn xs btn-amber-soft" onClick={() => act(p.id, 'flag')}>
                    Flag
                  </button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="card" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="h3" style={{ margin: 0 }}>
          Reconciliation
        </div>
        <div className="sub">Compares what the payment gateway and the escrow contract hold with the Tedoku ledger.</div>
        {(recon.data ?? []).map((r) => (
          <div key={r.title} className="soft-box">
            <div style={{ fontSize: 13, fontWeight: 700 }}>{r.title}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 6 }}>
              <span className="sub">Holds</span>
              <b>{r.holds}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span className="sub">Ledger</span>
              <b>{r.ledger}</b>
            </div>
            <div style={{ marginTop: 6 }}>
              <StatusPill tone={r.matches ? 'success' : 'danger'}>
                {r.matches ? 'Matches' : 'Mismatch'}
                {r.checkedAt ? ', checked ' + r.checkedAt : ''}
              </StatusPill>
            </div>
          </div>
        ))}
        <button className="btn btn-dark" disabled={checking} onClick={runCheck}>
          {checking ? 'Checking…' : 'Run check now'}
        </button>
        <div className="sub">Last checked: {checkedAt ?? '[time]'}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Controls

function Controls() {
  const contract = useQuery(() => adminApi.contract());
  const approvals = useQuery(() => adminApi.approvals());

  if (contract.loading && !contract.data) return <Loading />;
  if (contract.error || !contract.data) return <LoadError error={contract.error ?? new Error('No data')} retry={contract.reload} />;
  const c = contract.data;
  const paused = c.depositsPaused;

  const togglePause = async (v: boolean) => {
    contract.setData({ ...c, depositsPaused: v });
    contract.setData(await adminApi.setDepositsPaused(v));
  };
  const approve = async (id: string) => {
    const updated = await adminApi.approve(id);
    approvals.setData((approvals.data ?? []).map((a) => (a.id === id ? updated : a)));
  };

  return (
    <div className="split" style={{ gap: 16 }}>
      <div className="col">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="h3" style={{ margin: 0 }}>
            USDC escrow contract
          </div>
          <div className="mono">{c.address}</div>
          <div className="sub">{c.network} network. Example address.</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span className="sub">Held now</span>
            <b>{formatAmount(c.heldUsdc, 'usdc')}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span className="sub">Launch cap</span>
            <b>{c.capUsdc.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC</b>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--primary-soft)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: Math.max(1, (c.heldUsdc / c.capUsdc) * 100) + '%', background: 'var(--water)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Pause new USDC deposits</div>
              <div className="sub">
                {paused ? 'New USDC payments are blocked. Existing escrows still release and refund.' : 'Use this in an emergency. Existing escrows are not affected.'}
              </div>
            </div>
            <Switch danger label="Pause new USDC deposits" on={paused} onChange={togglePause} />
          </div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="h3" style={{ margin: 0 }}>
            Payment rails
          </div>
          <div className="row">
            <span style={{ fontSize: 14, flex: 1 }}>Naira (payment gateway)</span>
            <StatusPill tone="success">Operational</StatusPill>
          </div>
          <div className="row">
            <span style={{ fontSize: 14, flex: 1 }}>USDC (escrow contract)</span>
            <StatusPill tone={paused ? 'danger' : 'success'}>{paused ? 'Deposits paused' : 'Operational'}</StatusPill>
          </div>
          <Link to="/settings" className="link">
            Switch rails on or off in Settings
          </Link>
        </div>
      </div>
      <div className="card" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="h3" style={{ margin: 0 }}>
          Pending approvals
        </div>
        <div className="sub">Admin refunds and releases from the escrow contract need 2 of 3 signers. You are signer 1.</div>
        {(approvals.data ?? []).map((a) => {
          const done = a.approvals >= a.required;
          return (
            <div key={a.id} className="soft-box" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{a.text}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="sub">
                  {a.approvals} of {a.required} approvals
                </span>
                {done ? (
                  <StatusPill tone="success">Executed</StatusPill>
                ) : (
                  <button className="btn xs btn-success" style={{ height: 34, padding: '0 14px', fontSize: 13 }} onClick={() => approve(a.id)}>
                    Approve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
