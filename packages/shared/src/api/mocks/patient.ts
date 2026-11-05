/**
 * PLACEHOLDER patient-side data, copied from the design's sample content.
 * Delete this file's usage once the real endpoints are wired up.
 */
import type {
  AccessGrant,
  AccessLogEntry,
  AskReply,
  CycleData,
  DictionaryTerm,
  DoctorProfile,
  ExternalWalletOption,
  HomeSummary,
  LibraryArticle,
  PatientProfile,
  PublicPlatformSettings,
  SleepData,
  Wallet,
} from '../../types';

export const platformSettings: PublicPlatformSettings = {
  feePercent: 10,
  nairaEnabled: true,
  usdcEnabled: true,
  usdcDepositsPaused: false,
  nairaPerUsdc: 1515,
  disputeWindowHours: 48,
  doctorResponseMinutes: 60,
};

export const patient: PatientProfile = {
  id: 'p_1',
  fullName: 'Amara Okafor',
  alias: 'Luna-4821',
  contact: 'amara@example.com',
  dateOfBirth: '12 March 2001',
  appLock: false,
  discreetIcon: false,
  activeGrants: 2,
};

export const aliasSuggestions = ['Luna-4821', 'Willow-2209', 'Sage-7315'];

const doctorBase = (
  id: string,
  name: string,
  initials: string,
  specialty: string,
  languages: string[],
  rating: number,
  ratingCount: number,
  priceNaira: number,
  availabilityLabel: string,
  tint: string,
): DoctorProfile => ({
  id,
  name,
  initials,
  specialty,
  languages,
  rating,
  ratingCount,
  priceNaira,
  available: availabilityLabel === 'Available now',
  availabilityLabel,
  tint,
  about:
    'Gynaecologist who helps with cycle changes, period pain, discharge and fertility questions. Explains things in plain language and never rushes you.',
  council: 'Medical and Dental Council of Nigeria',
  verifiedOn: '[Date]',
  renewsOn: '[Date]',
  onChainProof: '0x4a7c19b2d8f03e65a1c4b7e2f9d0836a5c21e91d',
  ratingBreakdown: [
    { stars: 5, percent: 82 },
    { stars: 4, percent: 14 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 0 },
  ],
  reviews: [{ text: 'Listened properly and gave me clear next steps.' }],
});

export const doctors: DoctorProfile[] = [
  doctorBase('d_ife', 'Dr. Ife Adeyemi', 'IA', 'Gynaecology', ['English', 'Yoruba'], 4.9, 128, 5000, 'Available now', '#EFE6F5'),
  doctorBase('d_amina', 'Dr. Amina Bello', 'AB', 'Mental health', ['English', 'Hausa'], 4.8, 94, 6000, 'Available now', '#DCF0F5'),
  doctorBase('d_ngozi', 'Dr. Ngozi Eze', 'NE', 'Reproductive health', ['English', 'Igbo'], 4.9, 76, 5500, 'Available now', '#FBE3EA'),
  doctorBase('d_kunle', 'Dr. Kunle Ajayi', 'KA', 'Dentistry', ['English', 'Yoruba'], 4.6, 58, 4500, 'Available now', '#E3F3EC'),
  doctorBase('d_bisi', 'Dr. Bisi Lawal', 'BL', 'Ear, nose and throat', ['English', 'Yoruba'], 4.5, 41, 5000, 'Next: tomorrow, 10 am', '#FFF0D9'),
  doctorBase('d_chidi', 'Dr. Chidi Nwosu', 'CN', 'General practice', ['English', 'Igbo'], 4.7, 210, 4000, 'Next: tomorrow, 9 am', '#ECEDFB'),
];

export const specialties = [
  'Gynaecology',
  'Mental health',
  'Reproductive health',
  'General practice',
  'Dentistry',
  'Ear, nose and throat',
];

export const homeSummary = (): HomeSummary => ({
  cycle: { day: 4, lengthDays: 28, nextPeriodDate: '2026-11-19', loggedFlow: null },
  water: { consumedMl: 1200, goalMl: 2400 },
  sleep: { lastNightMinutes: 440, quality: 'Restful' },
  featuredDoctors: doctors.slice(0, 2).map((d) => ({ ...d, name: d.name.replace(/ (\w)\w+$/, ' $1.') })),
});

export const cycle: CycleData = {
  today: '2026-10-27',
  loggedDays: [
    '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20',
    '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18',
  ],
  flow: { '2026-10-14': 'Medium', '2026-10-15': 'Heavy' },
  symptoms: { '2026-10-14': ['Cramps'] },
};

export const sleep: SleepData = {
  goalHours: 8,
  usualHours: 6.5,
  week: [
    { day: 'Wed', hours: 6 },
    { day: 'Thu', hours: 7 },
    { day: 'Fri', hours: 5.5 },
    { day: 'Sat', hours: 8 },
    { day: 'Sun', hours: 7.5 },
    { day: 'Mon', hours: 6.5 },
    { day: 'Tue', hours: null },
  ],
  lastNight: { bed: '23:00', wake: '06:30', quality: 'Restful' },
};

export const grants: AccessGrant[] = [
  { id: 'g_a', initials: 'IA', tint: '#EFE6F5', doctorName: 'Dr. Ife Adeyemi', sharing: 'name and phone number', expiresLabel: 'Expires in 23 hours', revoked: false },
  { id: 'g_b', initials: 'AB', tint: '#DCF0F5', doctorName: 'Dr. Amina Bello', sharing: 'health summary (last 3 cycles)', expiresLabel: 'Expires in 6 days', revoked: false },
];

export const accessLog: AccessLogEntry[] = [
  { text: 'Dr. Ife viewed your name', when: 'Today, 10:42' },
  { text: 'Dr. Amina viewed your cycle summary', when: 'Yesterday, 18:05' },
  { text: 'You shared your name with Dr. Ife', when: 'Yesterday, 17:30' },
];

const answers = {
  late: {
    title: 'Why is my period late?',
    body: 'A late period is common and often not a sign of anything serious. Stress, big changes in sleep or weight, illness, travel and changing hormonal contraception can all delay it. Conditions such as PCOS or thyroid problems can too, and pregnancy is possible if you have had sex.',
    whenToSee: 'your period is more than three months late, you have severe pain or very heavy bleeding, or you have a positive pregnancy test with pain.',
  },
  disc: {
    title: 'Is my discharge normal?',
    body: 'Discharge is normal and changes through your cycle. It is often clear and stretchy around ovulation, and thicker or creamy at other times. A change in smell or colour, itching, burning or pain can point to an infection, which is usually treatable.',
    whenToSee: 'it has a strong smell, looks green, grey or yellow, itches or burns, or you may have been exposed to an infection.',
  },
  cramp: {
    title: 'What causes period cramps?',
    body: 'Cramps come from chemicals called prostaglandins that make your womb tighten to shed its lining. Mild to moderate cramps are common. Heat, rest and gentle movement can help.',
    whenToSee: 'pain stops you doing daily things, gets worse over time, or comes with very heavy bleeding.',
  },
};

/** PLACEHOLDER: the real service answers from doctor-reviewed sources. */
export function askReply(question: string): AskReply {
  const x = question.toLowerCase();
  if (/heavy bleeding|bleeding very|soaking|faint|collaps|suicid|kill myself|self.?harm|can.?t breathe|severe pain/.test(x))
    return { kind: 'urgent' };
  if (/late|missed/.test(x)) return { kind: 'answer', ...answers.late };
  if (/discharge/.test(x)) return { kind: 'answer', ...answers.disc };
  if (/cramp|pain/.test(x)) return { kind: 'answer', ...answers.cramp };
  return { kind: 'none' };
}

export const suggestedQuestions = ['Why is my period late?', 'Is my discharge normal?', 'What causes period cramps?'];

export const libraryTopics = ['Cycle and periods', 'Hormones', 'Sexual health', 'Contraception', 'Mental health', 'Pregnancy and fertility'];

export const articles: LibraryArticle[] = [
  ['What happens in each phase of your cycle', 'Cycle and periods'],
  ['Why periods can be irregular', 'Cycle and periods'],
  ['Oestrogen and progesterone, explained', 'Hormones'],
  ['PCOS: signs and when to get checked', 'Hormones'],
  ['Understanding vaginal discharge', 'Sexual health'],
  ['Getting tested for STIs: what to expect', 'Sexual health'],
  ['Contraception options compared', 'Contraception'],
  ['Period mood changes and PMDD', 'Mental health'],
  ['Your fertile window, explained', 'Pregnancy and fertility'],
].map(([title, topic], i) => ({ id: 'a' + i, title: title!, topic: topic! }));

export const dictionary: DictionaryTerm[] = [
  { word: 'Ovulation', definition: 'The release of an egg from an ovary, usually about halfway through a regular cycle.' },
  { word: 'Endometrium', definition: 'The lining of the womb. It thickens each cycle and is shed as your period if there is no pregnancy.' },
  { word: 'Prostaglandins', definition: 'Natural chemicals that make the womb muscle tighten. High levels can cause stronger period cramps.' },
  { word: 'Luteal phase', definition: 'The second half of your cycle, after ovulation, when progesterone rises. It ends when your period starts.' },
];

export const wallet: Wallet = {
  address: '0x91be03c7a42d58f6e1b0937c2a8d4f65e03b72ca',
  balanceUsdc: 12.4,
  network: 'Base',
};

export const externalWallets: ExternalWalletOption[] = [
  { id: 'metamask', name: 'MetaMask', initial: 'M', color: '#E2761B', note: 'Browser or mobile app' },
  { id: 'coinbase', name: 'Coinbase Wallet', initial: 'C', color: '#0052FF', note: 'Mobile app' },
  { id: 'walletconnect', name: 'WalletConnect', initial: 'W', color: '#3B99FC', note: 'Any compatible wallet' },
];
