import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { configureApi, type AuthSession } from '@tedoku/shared';

/**
 * Who is signed in, plus the sign-up details collected across onboarding.
 *
 * PLACEHOLDER: the token lives in memory only. When auth is real, persist it
 * with expo-secure-store and restore it on launch.
 */
interface SignupDraft {
  fullName: string;
  contact: string;
  dateOfBirth: string;
  password: string;
  alias: string;
}

interface SessionValue {
  session: AuthSession | null;
  setSession: (s: AuthSession | null) => void;
  draft: SignupDraft;
  updateDraft: (patch: Partial<SignupDraft>) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

let currentToken: string | null = null;
configureApi({ getToken: () => currentToken });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [draft, setDraft] = useState<SignupDraft>({ fullName: '', contact: '', dateOfBirth: '', password: '', alias: 'Luna-4821' });

  const value = useMemo<SessionValue>(
    () => ({
      session,
      setSession: (s) => {
        currentToken = s?.token ?? null;
        setSessionState(s);
      },
      draft,
      updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),
    }),
    [session, draft],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
