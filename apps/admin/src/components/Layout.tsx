import { createContext, useContext, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { adminApi, isUsingMocks } from '@tedoku/shared';
import { useQuery } from '../lib/useQuery';
import { Pill } from './ui';

const BadgesContext = createContext<() => void>(() => {});
/** Call after an action that changes a sidebar count (approving, resolving, holding…). */
export const useRefreshBadges = () => useContext(BadgesContext);

const NAV = [
  { label: 'Overview', to: '/', badge: null },
  { label: 'Verification queue', to: '/verification', badge: 'verification' },
  { label: 'Providers', to: '/providers', badge: null },
  { label: 'Escrow', to: '/escrow', badge: 'escrow' },
  { label: 'Disputes', to: '/disputes', badge: 'disputes' },
  { label: 'Settings', to: '/settings', badge: null },
] as const;

export function Layout() {
  const me = useQuery(() => adminApi.me());
  const badges = useQuery(() => adminApi.badges());

  return (
    <BadgesContext.Provider value={() => void badges.reload()}>
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              <DropIcon />
            </div>
            <div>
              <div className="brand-name">TEDOKU</div>
              <div className="brand-sub">Admin</div>
            </div>
          </div>
          <nav style={{ display: 'contents' }} aria-label="Main">
            {NAV.map((n) => {
              const count = n.badge && badges.data ? badges.data[n.badge] : 0;
              return (
                <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                  {n.label}
                  {count > 0 && <span className="nav-badge">{count}</span>}
                </NavLink>
              );
            })}
          </nav>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{me.data?.initial ?? '·'}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{me.data?.name ?? ''}</div>
              <div style={{ fontSize: 11, color: 'var(--sidebar-muted)' }}>{me.data?.role ?? ''}</div>
            </div>
          </div>
        </aside>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </BadgesContext.Provider>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {children}
        {isUsingMocks() && (
          <Pill bg="var(--warning-soft)" fg="var(--warning-ink)">
            Sample data
          </Pill>
        )}
      </div>
    </header>
  );
}

function DropIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z" />
    </svg>
  );
}
