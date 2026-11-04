import { Link } from 'react-router-dom';
import { adminApi } from '@tedoku/shared';
import { PageHeader } from '../components/Layout';
import { LoadError, Loading } from '../components/ui';
import { useQuery } from '../lib/useQuery';

export function OverviewPage() {
  const { data, error, loading, reload } = useQuery(() => adminApi.overview());

  return (
    <>
      <PageHeader title="Overview" />
      {loading && !data ? (
        <Loading />
      ) : error || !data ? (
        <LoadError error={error ?? new Error('No data')} retry={reload} />
      ) : (
        <div className="page">
          <div className="kpis" style={{ gridTemplateColumns: `repeat(${data.kpis.length}, minmax(0, 1fr))` }}>
            {data.kpis.map((k) => (
              <div key={k.label} className="card" style={{ padding: 16 }}>
                <div className="lbl">{k.label}</div>
                <div className="kpi-value">{k.value}</div>
                <div className="sub">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="hstack" style={{ gap: 18 }}>
            <div className="card" style={{ flex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="h3" style={{ margin: 0 }}>
                  Consultations this week
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 600 }}>
                  <Legend color="var(--primary)" label="Naira" />
                  <Legend color="var(--water)" label="USDC" />
                </div>
              </div>
              <WeeklyChart weekly={data.weekly} />
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div className="h3">Needs your attention</div>
              {data.attention.map((t) => (
                <Link key={t.label} to={t.to} className="row">
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{t.label}</div>
                  <span className="link">Open</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="h3">Recent activity</div>
            {data.activity.map((a) => (
              <div key={a.text} className="row">
                <div style={{ flex: 1, fontSize: 14 }}>{a.text}</div>
                <div className="sub">{a.when}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span>
      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: color, marginRight: 6 }} />
      {label}
    </span>
  );
}

function WeeklyChart({ weekly }: { weekly: { day: string; naira: number; usdc: number }[] }) {
  const max = Math.max(1, ...weekly.map((b) => b.naira + b.usdc));
  const scale = 156 / Math.max(78, max);
  return (
    <div
      role="img"
      aria-label={'Consultations this week: ' + weekly.map((b) => `${b.day} ${b.naira} naira, ${b.usdc} USDC`).join('; ')}
      style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 190, marginTop: 14, padding: '0 6px' }}
    >
      {weekly.map((b) => (
        <div key={b.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: 34, height: 156 }}>
            <div style={{ height: b.usdc * scale, background: 'var(--water)', borderRadius: '6px 6px 0 0' }} />
            <div style={{ height: b.naira * scale, background: 'var(--primary)' }} />
          </div>
          <div className="sub">{b.day}</div>
        </div>
      ))}
    </div>
  );
}
