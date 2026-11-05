import type { CSSProperties, ReactNode } from 'react';

export function Pill({ bg, fg, children, style }: { bg: string; fg: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <span className="pill" style={{ background: bg, color: fg, ...style }}>
      {children}
    </span>
  );
}

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export const TONES: Record<Tone, [string, string]> = {
  success: ['#E3F3EC', '#0F6B4F'],
  warning: ['#FFF4DC', '#5C3D00'],
  danger: ['#FFF1EC', '#8A2D14'],
  neutral: ['#F1EAF5', '#3F1D5E'],
  info: ['#ECEDFB', '#2E3190'],
};

export function StatusPill({ tone, children, style }: { tone: Tone; children: ReactNode; style?: CSSProperties }) {
  const [bg, fg] = TONES[tone];
  return (
    <Pill bg={bg} fg={fg} style={style}>
      {children}
    </Pill>
  );
}

export function Chip({
  on,
  onClick,
  children,
  variant,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  variant?: 'danger' | 'dark';
}) {
  return (
    <button type="button" className={`chip${on ? ' on' : ''}${variant ? ' ' + variant : ''}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

export function Switch({ on, onChange, label, danger }: { on: boolean; onChange: (v: boolean) => void; label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`switch${on ? ' on' : ''}${danger ? ' danger' : ''}`}
      onClick={() => onChange(!on)}
    >
      <span />
    </button>
  );
}

export function DetailRow({ label, value, labelWidth = 120, tight = 'tight' }: { label: string; value: ReactNode; labelWidth?: number; tight?: 'tight' | 'xtight' }) {
  return (
    <div className={`row ${tight}`}>
      <span className="sub" style={{ width: labelWidth, flex: 'none' }}>
        {label}
      </span>
      <b style={{ fontSize: 13 }}>{value}</b>
    </div>
  );
}

export function Loading() {
  return <div className="skeleton">Loading…</div>;
}

export function LoadError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="error">
      Could not load this page: {error.message}.{' '}
      <button className="link underline" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
