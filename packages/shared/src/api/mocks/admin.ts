/**
 * PLACEHOLDER admin dashboard data, from the design's sample content.
 */
import type {
  AdminOverview,
  AdminSettings,
  AdminUser,
  ApplicationReview,
  ChangeLogEntry,
  Dispute,
  EscrowAuditEntry,
  EscrowContract,
  EscrowItem,
  MultisigApproval,
  Payout,
  ProviderRecord,
} from '../../types';

export const adminUser: AdminUser = { name: 'Sam', role: 'Verification reviewer', initial: 'S' };

export const overview: AdminOverview = {
  kpis: [
    { label: 'New sign-ups, 7 days', value: '1,248', sub: 'Verified accounts only' },
    { label: 'Active users', value: '3,906', sub: 'Last 30 days' },
    { label: 'Consultations', value: '412', sub: 'Last 7 days' },
    { label: 'Platform fees', value: '₦206,000', sub: 'Naira and USDC combined' },
    { label: 'Open disputes', value: '3', sub: 'Payments on hold' },
  ],
  weekly: [
    { day: 'Mon', naira: 38, usdc: 10 },
    { day: 'Tue', naira: 45, usdc: 14 },
    { day: 'Wed', naira: 52, usdc: 12 },
    { day: 'Thu', naira: 41, usdc: 9 },
    { day: 'Fri', naira: 60, usdc: 18 },
    { day: 'Sat', naira: 55, usdc: 16 },
    { day: 'Sun', naira: 48, usdc: 13 },
  ],
  attention: [
    { label: '6 provider applications waiting', to: '/verification' },
    { label: '3 open disputes on held payments', to: '/disputes' },
    { label: '2 licenses due for renewal', to: '/providers' },
  ],
  activity: [
    { text: 'Dr. Zainab Musa was approved and her Verified badge was recorded on-chain', when: 'Today, 09:12' },
    { text: 'Dispute D-1041 was opened by a patient', when: 'Today, 08:40' },
    { text: 'Dr. Bisi Lawal was suspended after a complaint', when: 'Yesterday, 16:05' },
    { text: 'Platform fee was set to 10%', when: 'Monday, 11:30' },
  ],
};

const passing = [
  { label: 'Documents readable', passed: true, note: 'All three files opened' },
  { label: 'Face matches ID', passed: true, note: 'Selfie matches the ID photo' },
  { label: 'License format valid', passed: true, note: 'Number has the expected format' },
];

const docs = [{ label: 'Government ID' }, { label: 'Selfie' }, { label: 'License' }];

const mdcn = 'Medical and Dental Council of Nigeria';

export const applications: ApplicationReview[] = [
  { id: 'app_kunle', name: 'Dr. Kunle Ajayi', role: 'Dentist · General dentistry', license: 'MDCN ending 3302', council: mdcn, email: 'kunle@example.com', phone: '+234 800 000 0001', payout: 'Naira bank account', submittedOn: '[Date]', autoChecks: passing, documents: docs, decision: null },
  { id: 'app_halima', name: 'Dr. Halima Sani', role: 'Doctor · Gynaecology', license: 'MDCN ending 7719', council: mdcn, email: 'halima@example.com', phone: '+234 800 000 0002', payout: 'Naira and USDC', submittedOn: '[Date]', autoChecks: passing, documents: docs, decision: null },
  {
    id: 'app_emeka', name: 'Dr. Emeka Obi', role: 'ENT specialist · Ear, nose and throat', license: 'MDCN ending 0045', council: mdcn, email: 'emeka@example.com', phone: '+234 800 000 0003', payout: 'Naira bank account', submittedOn: '[Date]',
    autoChecks: [
      { label: 'Documents readable', passed: false, note: 'The ID photo is too blurry to read' },
      { label: 'Face matches ID', passed: true, note: 'Selfie matches the ID photo' },
      { label: 'License number found', passed: false, note: 'Not found on the register. Check the number by hand' },
    ],
    documents: docs, decision: null,
  },
  { id: 'app_chioma', name: 'Chioma Eze', role: 'Nurse or midwife · Midwifery', license: 'NMCN ending 2288', council: 'Nursing and Midwifery Council of Nigeria', email: 'chioma@example.com', phone: '+234 800 000 0004', payout: 'USDC wallet', submittedOn: '[Date]', autoChecks: passing, documents: docs, decision: null },
  { id: 'app_tunde', name: 'Dr. Tunde Bakare', role: 'Counsellor or psychologist · Counselling', license: 'Ending 6610', council: 'Issuing body as stated', email: 'tunde@example.com', phone: '+234 800 000 0005', payout: 'Naira bank account', submittedOn: '[Date]', autoChecks: passing, documents: docs, decision: { kind: 'info' } },
];

export const providers: ProviderRecord[] = [
  { id: 'pr_ife', name: 'Dr. Ife Adeyemi', role: 'Doctor', specialty: 'Gynaecology', status: 'Verified', rating: 4.9 },
  { id: 'pr_amina', name: 'Dr. Amina Bello', role: 'Doctor', specialty: 'Mental health', status: 'Verified', rating: 4.8 },
  { id: 'pr_ngozi', name: 'Dr. Ngozi Eze', role: 'Doctor', specialty: 'Reproductive health', status: 'Verified', rating: 4.9 },
  { id: 'pr_chidi', name: 'Dr. Chidi Nwosu', role: 'Doctor', specialty: 'General practice', status: 'Renewal due', rating: 4.7 },
  { id: 'pr_kunle', name: 'Dr. Kunle Ajayi', role: 'Dentist', specialty: 'General dentistry', status: 'Verified', rating: 4.6 },
  { id: 'pr_bisi', name: 'Dr. Bisi Lawal', role: 'ENT specialist', specialty: 'Ear, nose and throat', status: 'Suspended', rating: 4.5 },
];

export const disputes: Dispute[] = [
  {
    id: 'D-1041', issue: 'Doctor did not respond', patient: 'Luna-4821', doctor: 'Dr. Chidi Nwosu', amountLabel: '₦4,000', railLabel: 'Naira (card)', rail: 'naira', openedOn: '[Date]', status: 'Open',
    timeline: [
      { text: 'Patient paid and the chat opened', when: '[Time]' },
      { text: 'No reply from the doctor within the response time', when: '[Time]' },
      { text: 'Patient reported a problem', when: '[Time]' },
    ],
  },
  {
    id: 'D-1042', issue: 'Not as described', patient: 'Sage-7315', doctor: 'Dr. Amina Bello', amountLabel: 'Equivalent of ₦6,000 in USDC', railLabel: 'USDC (escrow contract)', rail: 'usdc', openedOn: '[Date]', status: 'Open',
    timeline: [
      { text: 'Patient paid into escrow', when: '[Time]' },
      { text: 'Chat completed by the doctor', when: '[Time]' },
      { text: 'Patient reported a problem within the dispute window', when: '[Time]' },
    ],
  },
  {
    id: 'D-1040', issue: 'Chat ended early', patient: 'Willow-2209', doctor: 'Dr. Ife Adeyemi', amountLabel: '₦5,000', railLabel: 'Naira (bank transfer)', rail: 'naira', openedOn: '[Date]', status: 'Resolved', resolution: 'refund',
    timeline: [
      { text: 'Patient paid and the chat opened', when: '[Time]' },
      { text: 'Admin reviewed the case', when: '[Time]' },
      { text: 'Refund sent to the original payment method', when: '[Time]' },
    ],
  },
];

export const escrow: EscrowItem[] = [
  { id: 'E-2031', patient: 'Luna-4821', doctor: 'Dr. Ife Adeyemi', rail: 'naira', gross: 5000, status: 'held', note: 'Chat in progress.' },
  { id: 'E-2030', patient: 'Willow-2209', doctor: 'Dr. Ife Adeyemi', rail: 'naira', gross: 5000, status: 'held', note: 'Chat in progress.' },
  { id: 'E-2029', patient: 'Rose-3304', doctor: 'Dr. Ngozi Eze', rail: 'usdc', gross: 3.3, status: 'window', note: 'Dispute window ends in 20 hours.' },
  { id: 'E-2028', patient: 'Aster-1190', doctor: 'Dr. Kunle Ajayi', rail: 'naira', gross: 4500, status: 'window', note: 'Dispute window ends in 18 hours.' },
  { id: 'E-2027', patient: 'Luna-4821', doctor: 'Dr. Chidi Nwosu', rail: 'naira', gross: 4000, status: 'on_hold', note: 'Dispute D-1041 is open. Funds are on hold.' },
  { id: 'E-2026', patient: 'Sage-7315', doctor: 'Dr. Amina Bello', rail: 'usdc', gross: 3.3, status: 'on_hold', note: 'Dispute D-1042 is open. Funds are on hold.' },
  { id: 'E-2025', patient: 'Maple-8841', doctor: 'Dr. Ife Adeyemi', rail: 'naira', gross: 5000, status: 'released', note: 'Paid out to the doctor.' },
  { id: 'E-2024', patient: 'Cedar-7741', doctor: 'Dr. Bisi Lawal', rail: 'usdc', gross: 3.3, status: 'refunded', note: 'Returned to the patient.' },
];

export const escrowAudit: EscrowAuditEntry[] = [
  { text: 'E-2027 placed on hold: dispute D-1041 opened', when: 'Today, 08:40' },
  { text: 'E-2025 released to Dr. Ife Adeyemi', when: 'Yesterday' },
];

export const payouts: Payout[] = [
  { id: 'P-505', doctor: 'Dr. Chidi Nwosu', destination: 'Bank account ending 5566', rail: 'naira', amount: 36000, status: 'Paid' },
  { id: 'P-504', doctor: 'Dr. Kunle Ajayi', destination: 'Bank account ending 0912', rail: 'naira', amount: 22500, status: 'Failed', note: 'The gateway timed out.' },
  { id: 'P-503', doctor: 'Dr. Ngozi Eze', destination: 'Bank account ending 7788', rail: 'naira', amount: 45000, status: 'Failed', note: 'The bank rejected the account details.' },
  { id: 'P-502', doctor: 'Dr. Amina Bello', destination: 'USDC wallet ending e91d', rail: 'usdc', amount: 20, status: 'Pending' },
  { id: 'P-501', doctor: 'Dr. Ife Adeyemi', destination: 'Bank account ending 4321', rail: 'naira', amount: 60000, status: 'Paid' },
];

export const contract: EscrowContract = {
  address: '0x7d3b21c94ae0f5586b1d03e7a29c4f8e60b15a37',
  network: 'Base',
  heldUsdc: 0,
  capUsdc: 5000,
  depositsPaused: false,
};

export const approvals: MultisigApproval[] = [
  { id: 'A71', text: 'Refund E-2026 to the patient (USDC)', approvals: 1, required: 2 },
  { id: 'A70', text: 'Release E-2029 to the doctor (USDC)', approvals: 1, required: 2 },
];

export const settings: AdminSettings = {
  feePercent: 10,
  feeCapPercent: 20,
  nairaEnabled: true,
  usdcEnabled: true,
  disputeWindow: '48 hours',
  responseTime: '1 hour',
};

export const disputeWindowOptions = ['24 hours', '48 hours', '72 hours'];
export const responseTimeOptions = ['30 minutes', '1 hour', '2 hours'];

export const changeLog: ChangeLogEntry[] = [
  { text: 'Platform fee set to 10%', when: 'Monday, 11:30' },
  { text: 'USDC payments switched on', when: 'Monday, 11:12' },
  { text: 'Doctor verification fee waived for launch', when: 'Monday, 10:55' },
];
