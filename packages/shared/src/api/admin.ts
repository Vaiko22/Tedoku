import { request } from './client';
import { endpoints as E } from './endpoints';
import * as A from './mocks/admin';
import { platformSettings } from './mocks/patient';
import type {
  AdminNavBadges,
  AdminOverview,
  AdminSettings,
  AdminUser,
  ApplicationDecision,
  ApplicationReview,
  ChangeLogEntry,
  Dispute,
  EscrowAuditEntry,
  EscrowContract,
  EscrowItem,
  EscrowStatus,
  MultisigApproval,
  Payout,
  ProviderRecord,
  Reconciliation,
} from '../types';
import { formatAmount } from '../format';

const finalStatus = (s: EscrowStatus) => s === 'released' || s === 'refunded';
const held = (rail: 'naira' | 'usdc') =>
  A.escrow.filter((i) => i.rail === rail && !finalStatus(i.status)).reduce((a, i) => a + i.gross, 0);

let lastReconciled: string | null = null;

export const adminApi = {
  me: () => request<AdminUser>({ path: E.admin.me }, () => A.adminUser),
  badges: () =>
    request<AdminNavBadges>({ path: E.admin.badges }, () => ({
      verification: A.applications.filter((a) => !a.decision || a.decision.kind === 'info').length,
      escrow: A.escrow.filter((i) => i.status === 'on_hold').length,
      disputes: A.disputes.filter((d) => d.status === 'Open').length,
    })),
  overview: () => request<AdminOverview>({ path: E.admin.overview }, () => A.overview),

  // ---------------------------------------------------------- Verification queue
  applications: () => request<ApplicationReview[]>({ path: E.admin.applications }, () => A.applications),
  /** Approve issues the Verified badge (recorded on-chain) and lists the doctor in the mobile app. */
  decide: (id: string, decision: ApplicationDecision | null) =>
    request<ApplicationReview>({ method: 'POST', path: E.admin.decide, params: { id }, body: decision ?? { kind: 'undo' } }, () => {
      const app = A.applications.find((a) => a.id === id)!;
      app.decision = decision;
      return app;
    }),

  // ---------------------------------------------------------- Providers
  providers: () => request<ProviderRecord[]>({ path: E.admin.providers }, () => A.providers),
  /** Suspend hides the doctor from search in the app; revoke also removes the on-chain badge. */
  providerAction: (id: string, action: 'suspend' | 'revoke', reason: string) =>
    request<ProviderRecord>({ method: 'POST', path: E.admin.providerAction, params: { id, action }, body: { reason } }, () => {
      const p = A.providers.find((x) => x.id === id)!;
      p.status = action === 'revoke' ? 'Revoked' : 'Suspended';
      return p;
    }),

  // ---------------------------------------------------------- Disputes
  disputes: () => request<Dispute[]>({ path: E.admin.disputes }, () => A.disputes),
  resolveDispute: (id: string, resolution: 'refund' | 'release') =>
    request<Dispute>({ method: 'POST', path: E.admin.resolveDispute, params: { id }, body: { resolution } }, () => {
      const d = A.disputes.find((x) => x.id === id)!;
      d.status = 'Resolved';
      d.resolution = resolution;
      return d;
    }),

  // ---------------------------------------------------------- Escrow
  escrow: () => request<EscrowItem[]>({ path: E.admin.escrow }, () => A.escrow),
  escrowAudit: () => request<EscrowAuditEntry[]>({ path: E.admin.escrowAudit }, () => A.escrowAudit),
  escrowAction: (id: string, action: 'release' | 'refund' | 'hold', reason: string, by: string) =>
    request<EscrowItem>({ method: 'POST', path: E.admin.escrowAction, params: { id, action }, body: { reason } }, () => {
      const item = A.escrow.find((x) => x.id === id)!;
      item.status = action === 'release' ? 'released' : action === 'refund' ? 'refunded' : 'on_hold';
      const what =
        action === 'release' ? 'released to ' + item.doctor : action === 'refund' ? 'refunded to ' + item.patient : 'placed on hold';
      A.escrowAudit.unshift({ text: `${item.id} ${what} (${reason.toLowerCase()}) by ${by}`, when: 'Just now' });
      return item;
    }),
  payouts: () => request<Payout[]>({ path: E.admin.payouts }, () => A.payouts),
  payoutAction: (id: string, action: 'retry' | 'flag') =>
    request<Payout>({ method: 'POST', path: E.admin.payoutAction, params: { id, action } }, () => {
      const p = A.payouts.find((x) => x.id === id)!;
      p.status = action === 'retry' ? 'Pending' : 'Flagged';
      return p;
    }),
  reconciliation: (runNow = false) =>
    request<Reconciliation[]>({ method: runNow ? 'POST' : 'GET', path: E.admin.reconciliation }, () => {
      if (runNow) lastReconciled = 'just now';
      return [
        { title: 'Naira held by the payment gateway', holds: formatAmount(held('naira'), 'naira'), ledger: formatAmount(held('naira'), 'naira'), matches: true, checkedAt: lastReconciled },
        { title: 'USDC held by the escrow contract', holds: formatAmount(held('usdc'), 'usdc'), ledger: formatAmount(held('usdc'), 'usdc'), matches: true, checkedAt: lastReconciled },
      ];
    }),
  contract: () => request<EscrowContract>({ path: E.admin.contract }, () => ({ ...A.contract, heldUsdc: held('usdc') })),
  /** Emergency switch. The mobile app hides USDC checkout while this is on. */
  setDepositsPaused: (paused: boolean) =>
    request<EscrowContract>({ method: 'POST', path: E.admin.pauseDeposits, body: { paused } }, () => {
      A.contract.depositsPaused = paused;
      platformSettings.usdcDepositsPaused = paused;
      return { ...A.contract, heldUsdc: held('usdc') };
    }),
  approvals: () => request<MultisigApproval[]>({ path: E.admin.approvals }, () => A.approvals),
  approve: (id: string) =>
    request<MultisigApproval>({ method: 'POST', path: E.admin.approve, params: { id } }, () => {
      const a = A.approvals.find((x) => x.id === id)!;
      a.approvals = Math.min(a.required, a.approvals + 1);
      return a;
    }),

  // ---------------------------------------------------------- Settings
  settings: () => request<AdminSettings>({ path: E.admin.settings }, () => A.settings),
  disputeWindowOptions: async () => A.disputeWindowOptions,
  responseTimeOptions: async () => A.responseTimeOptions,
  /** These values are what the mobile app reads from `platformApi.settings()`. */
  updateSettings: (patch: Partial<AdminSettings>) =>
    request<AdminSettings>({ method: 'PATCH', path: E.admin.settings, body: patch }, () => {
      const before = { ...A.settings };
      Object.assign(A.settings, patch);
      const describe: Record<string, string> = {
        feePercent: `Platform fee set to ${A.settings.feePercent}%`,
        nairaEnabled: `Naira payments switched ${A.settings.nairaEnabled ? 'on' : 'off'}`,
        usdcEnabled: `USDC payments switched ${A.settings.usdcEnabled ? 'on' : 'off'}`,
        disputeWindow: `Dispute window set to ${A.settings.disputeWindow}`,
        responseTime: `Doctor response time set to ${A.settings.responseTime}`,
      };
      for (const k of Object.keys(patch) as (keyof AdminSettings)[])
        if (before[k] !== A.settings[k] && describe[k]) A.changeLog.unshift({ text: describe[k]!, when: 'Just now' });
      platformSettings.feePercent = A.settings.feePercent;
      platformSettings.nairaEnabled = A.settings.nairaEnabled;
      platformSettings.usdcEnabled = A.settings.usdcEnabled;
      platformSettings.disputeWindowHours = parseInt(A.settings.disputeWindow, 10);
      return A.settings;
    }),
  changeLog: () => request<ChangeLogEntry[]>({ path: E.admin.changeLog }, () => A.changeLog),
};
