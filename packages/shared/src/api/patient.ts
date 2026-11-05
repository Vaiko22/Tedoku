import { request } from './client';
import { endpoints as E } from './endpoints';
import * as M from './mocks/patient';
import type {
  AccessGrant,
  AccessLogEntry,
  AskReply,
  AuthSession,
  CycleData,
  DictionaryTerm,
  DoctorProfile,
  DoctorSummary,
  Flow,
  HomeSummary,
  LibraryArticle,
  OnboardingSetup,
  PatientProfile,
  PublicPlatformSettings,
  SignInResult,
  SignUpDetails,
  SleepData,
  SleepQuality,
} from '../types';

const ok = (role: AuthSession['role'] = 'patient'): SignInResult => ({
  status: 'ok',
  session: { token: 'placeholder-token', role, userId: role === 'patient' ? 'p_1' : 'd_ife' },
});

/** Platform-wide settings. Admins change these in the dashboard; the app reads them. */
export const platformApi = {
  settings: () => request<PublicPlatformSettings>({ path: E.platform.settings }, () => M.platformSettings),
};

export const authApi = {
  /** PLACEHOLDER behaviour: password "wrong" fails, contacts starting with "new" have no account. */
  signIn: (contact: string, password: string) =>
    request<SignInResult>({ method: 'POST', path: E.auth.signIn, body: { contact, password } }, () => {
      if (contact.trim().toLowerCase().startsWith('new')) return { status: 'not_found' };
      if (password === 'wrong') return { status: 'wrong_password', attemptsLeft: 4 };
      return ok();
    }),
  signInWithGoogle: () => request<SignInResult>({ method: 'POST', path: E.auth.social, body: { provider: 'google' } }, () => ok()),
  signUp: (details: SignUpDetails) =>
    request<{ verificationSentTo: string }>({ method: 'POST', path: E.auth.signUp, body: details }, () => ({
      verificationSentTo: details.contact,
    })),
  verifyCode: (contact: string, code: string) =>
    request<SignInResult>({ method: 'POST', path: E.auth.verifyCode, body: { contact, code } }, () => ok()),
  resendCode: (contact: string) => request<void>({ method: 'POST', path: E.auth.resendCode, body: { contact } }, () => undefined),
  /** Always succeeds, so nobody can use it to find out who has an account. */
  forgotPassword: (contact: string, role: 'patient' | 'provider') =>
    request<void>({ method: 'POST', path: E.auth.forgotPassword, body: { contact, role } }, () => undefined),
  /** PLACEHOLDER behaviour: "000000" is treated as wrong or expired. */
  checkResetCode: (contact: string, code: string) =>
    request<{ valid: boolean; resetToken?: string }>({ method: 'POST', path: E.auth.checkResetCode, body: { contact, code } }, () =>
      code === '000000' ? { valid: false } : { valid: true, resetToken: 'placeholder-reset' },
    ),
  resetPassword: (resetToken: string, password: string) =>
    request<void>({ method: 'POST', path: E.auth.resetPassword, body: { resetToken, password } }, () => undefined),
  /** PLACEHOLDER behaviour: password "wrong" fails, emails starting with "pending" are still in review. */
  providerSignIn: (email: string, password: string) =>
    request<SignInResult>({ method: 'POST', path: E.auth.providerSignIn, body: { email, password } }, () => {
      if (password === 'wrong') return { status: 'wrong_password', attemptsLeft: 4 };
      if (email.trim().toLowerCase().startsWith('pending')) return { status: 'pending_review' };
      return ok('provider');
    }),
  signOut: () => request<void>({ method: 'POST', path: E.auth.signOut }, () => undefined),
};

export const patientApi = {
  me: () => request<PatientProfile>({ path: E.patient.me }, () => M.patient),
  aliasSuggestions: () => request<string[]>({ path: E.patient.aliasSuggestions }, () => M.aliasSuggestions),
  /** The private ID is permanent once confirmed. */
  confirmAlias: (alias: string) =>
    request<{ available: boolean }>({ method: 'POST', path: E.patient.alias, body: { alias } }, () => {
      M.patient.alias = alias;
      return { available: true };
    }),
  saveSetup: (setup: OnboardingSetup) => request<void>({ method: 'PUT', path: E.patient.setup, body: setup }, () => undefined),
  updateSettings: (patch: Partial<Pick<PatientProfile, 'appLock' | 'discreetIcon'>>) =>
    request<PatientProfile>({ method: 'PATCH', path: E.patient.settings, body: patch }, () => Object.assign(M.patient, patch)),
  home: () => request<HomeSummary>({ path: E.patient.home }, M.homeSummary),
  logWater: (deltaMl: number) => request<void>({ method: 'POST', path: E.patient.water, body: { deltaMl } }, () => undefined),
  logSleepQuality: (quality: SleepQuality) =>
    request<void>({ method: 'POST', path: E.patient.sleepQuality, body: { quality } }, () => undefined),

  cycle: () => request<CycleData>({ path: E.patient.cycle }, () => M.cycle),
  updateCycleDay: (date: string, patch: { period?: boolean; flow?: Flow; symptoms?: string[] }) =>
    request<void>({ method: 'PUT', path: E.patient.cycleDay, params: { date }, body: patch }, () => {
      if (patch.period === true && !M.cycle.loggedDays.includes(date)) M.cycle.loggedDays.push(date);
      if (patch.period === false) M.cycle.loggedDays = M.cycle.loggedDays.filter((d) => d !== date);
      if (patch.flow) M.cycle.flow[date] = patch.flow;
      if (patch.symptoms) M.cycle.symptoms[date] = patch.symptoms;
    }),

  sleep: () => request<SleepData>({ path: E.patient.sleep }, () => M.sleep),
  saveSleepGoal: (usualHours: number, goalHours: number) =>
    request<void>({ method: 'PUT', path: E.patient.sleepGoal, body: { usualHours, goalHours } }, () => {
      M.sleep.usualHours = usualHours;
      M.sleep.goalHours = goalHours;
    }),
  logSleep: (bed: string, wake: string, quality: SleepQuality) =>
    request<void>({ method: 'POST', path: E.patient.sleep, body: { bed, wake, quality } }, () => {
      M.sleep.lastNight = { bed, wake, quality };
    }),

  grants: () => request<AccessGrant[]>({ path: E.patient.grants }, () => M.grants),
  revokeGrant: (id: string) =>
    request<void>({ method: 'POST', path: E.patient.revokeGrant, params: { id } }, () => {
      const g = M.grants.find((x) => x.id === id);
      if (g) g.revoked = true;
    }),
  accessLog: () => request<AccessLogEntry[]>({ path: E.patient.accessLog }, () => M.accessLog),
  exportData: () => request<void>({ method: 'POST', path: E.patient.exportData }, () => undefined),
  deleteEverything: () => request<void>({ method: 'DELETE', path: E.patient.deleteData }, () => undefined),
};

export const doctorsApi = {
  list: (filter?: { specialty?: string; q?: string }) =>
    request<DoctorSummary[]>({ path: E.doctors.list, query: filter }, () =>
      M.doctors.filter(
        (d) =>
          (!filter?.specialty || filter.specialty === 'All' || d.specialty === filter.specialty) &&
          (d.name + ' ' + d.specialty).toLowerCase().includes((filter?.q ?? '').toLowerCase()),
      ),
    ),
  specialties: () => request<string[]>({ path: E.doctors.specialties }, () => M.specialties),
  detail: (id: string) =>
    request<DoctorProfile>({ path: E.doctors.detail, params: { id } }, () => M.doctors.find((d) => d.id === id) ?? M.doctors[0]!),
};

export const askApi = {
  ask: (question: string) => request<AskReply>({ method: 'POST', path: E.ask.question, body: { question } }, () => M.askReply(question)),
  suggestions: async () => M.suggestedQuestions,
  topics: async () => M.libraryTopics,
  articles: (filter?: { topic?: string; q?: string }) =>
    request<LibraryArticle[]>({ path: E.ask.articles, query: filter }, () =>
      M.articles.filter(
        (a) =>
          (!filter?.topic || filter.topic === 'All' || a.topic === filter.topic) &&
          (a.title + ' ' + a.topic).toLowerCase().includes((filter?.q ?? '').toLowerCase()),
      ),
    ),
  dictionary: () => request<DictionaryTerm[]>({ path: E.ask.dictionary }, () => M.dictionary),
};
