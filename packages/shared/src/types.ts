/**
 * Domain types shared by the mobile app, the admin dashboard and (eventually)
 * the backend. When the real endpoints are ready, make sure their JSON matches
 * these shapes, or adapt the responses in `api/*.ts`.
 */

export type Rail = 'naira' | 'usdc';
export type NairaMethod = 'card' | 'transfer' | 'ussd';
export type UsdcSource = 'inapp' | 'external';
export type Flow = 'Light' | 'Medium' | 'Heavy';
export type SleepQuality = 'Restful' | 'Okay' | 'Poor';
export type Role = 'patient' | 'provider';

// ---------------------------------------------------------------- Platform

/** Settings set by admins in the dashboard and read by the mobile app. */
export interface PublicPlatformSettings {
  feePercent: number;
  nairaEnabled: boolean;
  usdcEnabled: boolean;
  usdcDepositsPaused: boolean;
  /** Sample rate locked at checkout. */
  nairaPerUsdc: number;
  disputeWindowHours: number;
  doctorResponseMinutes: number;
}

// ---------------------------------------------------------------- Auth

export interface AuthSession {
  token: string;
  role: Role;
  userId: string;
}

export type SignInResult =
  | { status: 'ok'; session: AuthSession }
  | { status: 'wrong_password'; attemptsLeft: number }
  | { status: 'not_found' }
  | { status: 'pending_review' };

export interface SignUpDetails {
  fullName: string;
  contact: string;
  dateOfBirth?: string;
  password: string;
}

// ---------------------------------------------------------------- Patient

export interface PatientProfile {
  id: string;
  fullName: string;
  alias: string;
  contact: string;
  dateOfBirth: string;
  appLock: boolean;
  discreetIcon: boolean;
  activeGrants: number;
}

export interface OnboardingSetup {
  cycleLengthDays: number;
  lastPeriod: 'today' | 'few' | 'week' | 'skip';
  waterGoalMl: number;
}

export interface HomeSummary {
  cycle: { day: number | null; lengthDays: number; nextPeriodDate: string | null; loggedFlow: Flow | null };
  water: { consumedMl: number; goalMl: number };
  sleep: { lastNightMinutes: number; quality: SleepQuality };
  featuredDoctors: DoctorSummary[];
}

export interface CycleData {
  today: string; // ISO yyyy-mm-dd
  loggedDays: string[];
  flow: Record<string, Flow>;
  symptoms: Record<string, string[]>;
}

export interface SleepData {
  goalHours: number;
  usualHours: number;
  week: { day: string; hours: number | null }[];
  lastNight: { bed: string; wake: string; quality: SleepQuality };
}

export interface AccessGrant {
  id: string;
  doctorName: string;
  initials: string;
  tint: string;
  sharing: string;
  expiresLabel: string;
  revoked: boolean;
}

export interface AccessLogEntry {
  text: string;
  when: string;
}

// ---------------------------------------------------------------- Doctors

export interface DoctorSummary {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  languages: string[];
  rating: number;
  ratingCount: number;
  priceNaira: number;
  available: boolean;
  availabilityLabel: string;
  tint: string;
}

export interface DoctorProfile extends DoctorSummary {
  about: string;
  council: string;
  verifiedOn: string;
  renewsOn: string;
  onChainProof: string;
  ratingBreakdown: { stars: number; percent: number }[];
  reviews: { text: string }[];
}

// ---------------------------------------------------------------- Ask Tedoku

export type AskReply =
  | { kind: 'answer'; title: string; body: string; whenToSee: string }
  | { kind: 'urgent' }
  | { kind: 'none' };

export interface LibraryArticle {
  id: string;
  title: string;
  topic: string;
}

export interface DictionaryTerm {
  word: string;
  definition: string;
}

// ---------------------------------------------------------------- Payments

export interface Checkout {
  id: string;
  doctor: DoctorSummary;
  amountNaira: number;
  amountUsdc: number;
  nairaPerUsdc: number;
  feeIncluded: boolean;
}

export interface BankTransferDetails {
  bank: string;
  accountNumber: string;
  accountName: string;
  expiresInMinutes: number;
}

export interface PaymentResult {
  status: 'success' | 'failed';
  reference?: string;
  reason?: string;
  consultationId?: string;
}

export interface Wallet {
  address: string;
  balanceUsdc: number;
  network: 'Base';
}

export interface ExternalWalletOption {
  id: string;
  name: string;
  initial: string;
  color: string;
  note: string;
}

// ---------------------------------------------------------------- Chat

export type MessageFrom = 'patient' | 'doctor' | 'system';

export interface ChatMessage {
  id: string;
  from: MessageFrom;
  text: string;
  sentAt?: string;
}

export interface Consultation {
  id: string;
  doctor: DoctorSummary;
  patientAlias: string;
  patientAgeRange: string;
  rail: Rail;
  amountLabel: string;
  status: 'active' | 'awaiting_confirmation' | 'completed';
  messages: ChatMessage[];
  revealed?: { name?: string; phone?: string; until?: string };
  sharedSummary?: string[];
}

export type RevealField = 'name' | 'phone' | 'location' | 'summary';

// ---------------------------------------------------------------- Provider

export interface ProviderApplication {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  profession: string;
  specialty: string;
  licenseNumber: string;
  council: string;
  documents: { governmentId: boolean; selfie: boolean; license: boolean };
  payout: 'bank' | 'usdc' | 'both';
  bankName?: string;
  accountNumber?: string;
  feeNaira?: number;
}

export interface ApplicationIssue {
  field: 'license' | 'governmentId' | 'selfie';
  title: string;
  detail: string;
}

export interface ProviderSetupTask {
  label: string;
  note: string;
  done: boolean;
  target: 'profile' | 'earnings';
}

export interface ProviderInboxItem {
  id: string;
  alias: string;
  initials: string;
  tint: string;
  ageRange: string;
  topic: string;
  paidLabel: string;
  replyWithin?: string;
  status: 'request' | 'active' | 'done';
  doneNote?: string;
}

export interface ProviderDashboard {
  name: string;
  initials: string;
  justApproved: boolean;
  available: boolean;
  stats: { label: string; value: string; note: string }[];
  setupTasks: ProviderSetupTask[];
  requests: ProviderInboxItem[];
}

export interface EarningsEscrowLine {
  alias: string;
  status: string;
  share: number;
  gross: number;
}

export interface EarningsHistoryLine {
  text: string;
  when: string;
  amount: number;
}

export interface ProviderEarnings {
  rail: Rail;
  available: number;
  held: number;
  escrow: EarningsEscrowLine[];
  history: EarningsHistoryLine[];
  bankLast4: string;
  payoutWallet: string;
}

export interface ProviderProfile {
  name: string;
  initials: string;
  email: string;
  phone: string;
  available: boolean;
  feeNaira: number;
  languages: string[];
  payoutWallet: string;
  bankLast4: string;
  monthEarnings: { total: number; naira: number; usdcInNaira: number; chats: number };
  documents: { title: string; detail: string }[];
  licenseRenewsOn: string;
}

export type ApplicationTimelineStep = { label: string; note: string; state: 'done' | 'current' | 'todo' };

// ---------------------------------------------------------------- Admin

export interface AdminUser {
  name: string;
  role: string;
  initial: string;
}

export interface AdminNavBadges {
  verification: number;
  escrow: number;
  disputes: number;
}

export interface AdminOverview {
  kpis: { label: string; value: string; sub: string }[];
  weekly: { day: string; naira: number; usdc: number }[];
  attention: { label: string; to: string }[];
  activity: { text: string; when: string }[];
}

export type ApplicationDecision =
  | { kind: 'approved' }
  | { kind: 'rejected'; reason: string }
  | { kind: 'info' };

export interface ApplicationReview {
  id: string;
  name: string;
  role: string;
  license: string;
  council: string;
  email: string;
  phone: string;
  payout: string;
  submittedOn: string;
  autoChecks: { label: string; passed: boolean; note: string }[];
  documents: { label: string; url?: string }[];
  decision: ApplicationDecision | null;
}

export type ProviderStatus = 'Verified' | 'Renewal due' | 'Suspended' | 'Revoked';

export interface ProviderRecord {
  id: string;
  name: string;
  role: string;
  specialty: string;
  status: ProviderStatus;
  rating: number;
}

export interface Dispute {
  id: string;
  issue: string;
  patient: string;
  doctor: string;
  amountLabel: string;
  railLabel: string;
  rail: Rail;
  openedOn: string;
  status: 'Open' | 'Resolved';
  resolution?: 'refund' | 'release';
  timeline: { text: string; when: string }[];
}

export type EscrowStatus = 'held' | 'window' | 'on_hold' | 'released' | 'refunded';

export interface EscrowItem {
  id: string;
  patient: string;
  doctor: string;
  rail: Rail;
  gross: number;
  status: EscrowStatus;
  note: string;
}

export interface EscrowAuditEntry {
  text: string;
  when: string;
}

export type PayoutStatus = 'Paid' | 'Pending' | 'Failed' | 'Flagged';

export interface Payout {
  id: string;
  doctor: string;
  destination: string;
  rail: Rail;
  amount: number;
  status: PayoutStatus;
  note?: string;
}

export interface Reconciliation {
  title: string;
  holds: string;
  ledger: string;
  matches: boolean;
  checkedAt: string | null;
}

export interface EscrowContract {
  address: string;
  network: string;
  heldUsdc: number;
  capUsdc: number;
  depositsPaused: boolean;
}

export interface MultisigApproval {
  id: string;
  text: string;
  approvals: number;
  required: number;
}

export interface AdminSettings {
  feePercent: number;
  feeCapPercent: number;
  nairaEnabled: boolean;
  usdcEnabled: boolean;
  disputeWindow: string;
  responseTime: string;
}

export interface ChangeLogEntry {
  text: string;
  when: string;
}
