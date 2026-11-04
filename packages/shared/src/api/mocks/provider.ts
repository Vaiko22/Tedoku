/**
 * PLACEHOLDER provider (doctor) side data and consultations, from the design's sample content.
 */
import type {
  ApplicationTimelineStep,
  ChatMessage,
  Consultation,
  ProviderDashboard,
  ProviderEarnings,
  ProviderInboxItem,
  ProviderProfile,
  Rail,
} from '../../types';
import { doctors } from './patient';

export const providerWallet = '0x4a7c19b2d8f03e65a1c4b7e2f9d0836a5c21e91d';

export const professions: { id: string; label: string; specialties: string[] }[] = [
  { id: 'Doctor', label: 'Doctor', specialties: ['Gynaecology', 'General practice', 'Mental health', 'Reproductive health'] },
  { id: 'Nurse', label: 'Nurse or midwife', specialties: ['Midwifery', 'Community health'] },
  { id: 'Counsellor', label: 'Counsellor or psychologist', specialties: ['Counselling', 'Psychology'] },
  { id: 'Dentist', label: 'Dentist', specialties: ['General dentistry', 'Oral health'] },
  { id: 'ENT', label: 'ENT specialist (ear, nose and throat)', specialties: ['Ear, nose and throat'] },
];

export const applicationTimeline: ApplicationTimelineStep[] = [
  { label: 'Application sent', note: 'Your details and documents were received', state: 'done' },
  { label: 'Licence check', note: 'We are matching your MDCN number to the register', state: 'current' },
  { label: 'Final review', note: 'A reviewer approves your profile', state: 'todo' },
  { label: 'Payout wallet ready', note: 'Your designated wallet is created once you are approved', state: 'todo' },
];

export const inbox: ProviderInboxItem[] = [
  { id: 'r1', initials: 'L', tint: '#EFE6F5', alias: 'Luna-4821', ageRange: '25 to 34', topic: 'Irregular periods and pain on one side', paidLabel: 'Paid ₦5,000 · held', replyWithin: 'Reply within 52 min', status: 'request' },
  { id: 'r2', initials: 'S', tint: '#DCF0F5', alias: 'Sage-7315', ageRange: '18 to 24', topic: 'Is my discharge normal?', paidLabel: 'Paid in USDC · held in escrow', replyWithin: 'Reply within 41 min', status: 'request' },
  { id: 'c_willow', initials: 'W', tint: '#FBE3EA', alias: 'Willow-2209', ageRange: '25 to 34', topic: 'You: Let us start with your last three cycles.', paidLabel: 'Paid ₦5,000 · held', status: 'active' },
  { id: 'c_rose', initials: 'R', tint: '#ECEDFB', alias: 'Rose-3304', ageRange: '35 to 44', topic: 'Thank you, that helps a lot.', paidLabel: 'Paid in USDC · held in escrow', status: 'active' },
  { id: 'c_aster', initials: 'A', tint: '#E3F3EC', alias: 'Aster-1190', ageRange: '25 to 34', topic: 'Consultation completed', paidLabel: 'Paid out', status: 'done', doneNote: 'Rated 5 out of 5 (anonymous)' },
  { id: 'c_maple', initials: 'M', tint: '#FFF0D9', alias: 'Maple-8841', ageRange: '18 to 24', topic: 'Consultation completed', paidLabel: 'Paid out', status: 'done', doneNote: 'Rated 4 out of 5 (anonymous)' },
];

export const dashboard = (available: boolean): ProviderDashboard => ({
  name: 'Dr. Ife Adeyemi',
  initials: 'IA',
  justApproved: true,
  available,
  stats: [
    { label: 'New requests', value: String(inbox.filter((i) => i.status === 'request').length), note: 'Reply within 1 hr' },
    { label: 'In escrow', value: '₦11,000', note: 'Naira, on hold' },
    { label: 'In escrow', value: '8.5 USDC', note: 'On Base' },
  ],
  setupTasks: [
    { label: 'Verified ID and licence', note: 'Approved by the Tedoku team', done: true, target: 'profile' },
    { label: 'Payout wallet', note: 'Designated wallet created for you', done: true, target: 'earnings' },
    { label: 'Languages you speak', note: 'Add at least one so patients can match with you', done: false, target: 'profile' },
    { label: 'Consultation price', note: 'Set what a chat costs in naira', done: false, target: 'profile' },
    { label: 'Weekly availability', note: 'Choose the hours you usually reply', done: false, target: 'profile' },
  ],
  requests: inbox.filter((i) => i.status === 'request'),
});

export const earnings: Record<Rail, ProviderEarnings> = {
  naira: {
    rail: 'naira',
    available: 112500,
    held: 13500,
    escrow: [
      { alias: 'Willow-2209', status: 'Chat in progress', share: 4500, gross: 5000 },
      { alias: 'Luna-4821', status: 'Waiting for you to accept', share: 4500, gross: 5000 },
      { alias: 'Aster-1190', status: 'Dispute open. Funds on hold', share: 4500, gross: 5000 },
    ],
    history: [
      { text: 'Released from Maple-8841', when: 'Yesterday', amount: 4500 },
      { text: 'Withdrawn to bank ending 4321', when: 'Last week', amount: -60000 },
      { text: 'Released from Aster-1190', when: 'Last week', amount: 4500 },
    ],
    bankLast4: '4321',
    payoutWallet: providerWallet,
  },
  usdc: {
    rail: 'usdc',
    available: 24.5,
    held: 6.6,
    escrow: [
      { alias: 'Sage-7315', status: 'Chat in progress', share: 2.97, gross: 3.3 },
      { alias: 'Rose-3304', status: 'In the dispute window, ends in 20 h', share: 2.97, gross: 3.3 },
    ],
    history: [
      { text: 'Released from Rose-2210', when: 'Yesterday', amount: 2.97 },
      { text: 'Released from Cedar-7741', when: 'Last week', amount: 2.97 },
    ],
    bankLast4: '4321',
    payoutWallet: providerWallet,
  },
};

export const providerProfile: ProviderProfile = {
  name: 'Dr. Ife Adeyemi',
  initials: 'IA',
  email: 'ife.adeyemi@example.com',
  phone: '+234 800 000 0000',
  available: true,
  feeNaira: 5000,
  languages: ['English', 'Yoruba'],
  payoutWallet: providerWallet,
  bankLast4: '4321',
  monthEarnings: { total: 148500, naira: 112500, usdcInNaira: 36000, chats: 12 },
  documents: [
    { title: 'Government ID', detail: 'National ID ending 4821 · verified on [Date]' },
    { title: 'Selfie', detail: 'Matched to your ID · verified on [Date]' },
    { title: 'Professional license', detail: 'MDCN ending 5821 · council register checked' },
  ],
  licenseRenewsOn: '[Date]',
};

export const allLanguages = ['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin', 'French'];

let msgId = 100;
export const nextMessageId = () => 'm' + ++msgId;

const ife = doctors[0]!;

/** Patient-side chat with Dr. Ife, and the provider-side chat with Luna-4821. */
export const consultations: Record<string, Consultation> = {
  c_luna: {
    id: 'c_luna',
    doctor: ife,
    patientAlias: 'Luna-4821',
    patientAgeRange: '25 to 34',
    rail: 'naira',
    amountLabel: '₦5,000',
    status: 'active',
    sharedSummary: ['Last 3 cycles: 27, 29 and 28 days', 'Last period started: 14 Oct · usual length 5 days', 'Symptoms logged: cramps'],
    messages: [
      { id: 'm1', from: 'doctor', text: 'Hello Luna-4821. I am Dr. Ife. What would you like to talk about today?' },
      { id: 'm2', from: 'patient', text: 'My periods have been irregular for three months and I get pain on one side.' },
      { id: 'm3', from: 'doctor', text: 'Thank you for sharing that. How long does the pain last, and is the bleeding heavier than usual?' },
    ] satisfies ChatMessage[],
  },
};

export const doctorAutoReply = 'Thank you. I am reading this carefully and will reply shortly.';

export const quickReplies = ['How long has this been happening?', 'Any bleeding between periods?', 'Have you taken a pregnancy test?'];
