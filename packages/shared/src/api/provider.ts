import { request } from './client';
import { endpoints as E } from './endpoints';
import * as P from './mocks/provider';
import type {
  ApplicationIssue,
  ApplicationTimelineStep,
  ProviderApplication,
  ProviderDashboard,
  ProviderEarnings,
  ProviderInboxItem,
  ProviderProfile,
  Rail,
} from '../types';

let available = false;

export const providerApi = {
  professions: async () => P.professions,
  languages: async () => P.allLanguages,
  quickReplies: async () => P.quickReplies,

  /** Submits a new provider application. It then shows up in the admin Verification queue. */
  apply: (application: ProviderApplication) =>
    request<{ id: string; payoutWallet?: string }>({ method: 'POST', path: E.provider.apply, body: application }, () => ({
      id: 'app_new',
      payoutWallet: application.payout === 'bank' ? undefined : P.providerWallet,
    })),
  /** Shown while an application is waiting for an admin decision. */
  applicationStatus: () =>
    request<{ state: 'pending' | 'approved' | 'rejected'; timeline: ApplicationTimelineStep[]; issues: ApplicationIssue[] }>(
      { path: E.provider.applicationStatus },
      () => ({ state: 'pending', timeline: P.applicationTimeline, issues: failedIssues }),
    ),

  dashboard: () => request<ProviderDashboard>({ path: E.provider.dashboard }, () => P.dashboard(available)),
  setAvailability: (on: boolean) =>
    request<void>({ method: 'PUT', path: E.provider.availability, body: { available: on } }, () => {
      available = on;
      P.providerProfile.available = on;
    }),

  inbox: () => request<ProviderInboxItem[]>({ path: E.provider.inbox }, () => P.inbox),
  accept: (id: string) =>
    request<void>({ method: 'POST', path: E.provider.accept, params: { id } }, () => {
      const item = P.inbox.find((i) => i.id === id);
      if (item) item.status = 'active';
    }),
  decline: (id: string) =>
    request<void>({ method: 'POST', path: E.provider.decline, params: { id } }, () => {
      const idx = P.inbox.findIndex((i) => i.id === id);
      if (idx >= 0) P.inbox.splice(idx, 1);
    }),

  earnings: (rail: Rail) => request<ProviderEarnings>({ path: E.provider.earnings, query: { rail } }, () => P.earnings[rail]),
  withdraw: (rail: Rail, amount: number, toAddress?: string) =>
    request<ProviderEarnings>({ method: 'POST', path: E.provider.withdraw, body: { rail, amount, toAddress } }, () => {
      const e = P.earnings[rail];
      e.available = Math.round((e.available - amount) * 100) / 100;
      e.history.unshift({
        text: rail === 'usdc' ? 'Withdrawn to wallet ending ' + (toAddress ?? '').slice(-4) : 'Withdrawn to bank ending ' + e.bankLast4,
        when: 'Just now',
        amount: -amount,
      });
      return e;
    }),

  profile: () => request<ProviderProfile>({ path: E.provider.profile }, () => P.providerProfile),
  updateProfile: (patch: Partial<Pick<ProviderProfile, 'available' | 'feeNaira' | 'languages'>>) =>
    request<ProviderProfile>({ method: 'PATCH', path: E.provider.profile, body: patch }, () => Object.assign(P.providerProfile, patch)),
};

const failedIssues: ApplicationIssue[] = [
  {
    field: 'license',
    title: 'License number not found',
    detail: 'We could not match it to the council register. Check the number and the issuing council.',
  },
  {
    field: 'governmentId',
    title: 'Government ID photo unreadable',
    detail: 'The photo is too blurry to read. Upload a clear, well-lit photo of the whole ID.',
  },
];

export const providerApplicationIssues = failedIssues;
