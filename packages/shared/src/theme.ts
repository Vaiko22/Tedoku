/**
 * Tedoku design tokens, taken from the "Tedoku: app screens" design canvas.
 * Shared by the mobile app and the admin dashboard so both stay on-brand.
 */
export const colors = {
  // Brand
  primary: '#5B2A86',
  primaryDeep: '#3F1D5E',
  primaryDarker: '#3A1A57',
  sidebar: '#2A1342',
  primarySoft: '#EFE6F5',
  primaryMist: '#F1EAF5',
  primaryWash: '#F3E9F7',
  primaryTint: '#F4EFF8',
  sidebarMuted: '#D9C8E8',
  splashMuted: '#E8DDF2',

  // Surfaces
  bg: '#FBF7F4',
  adminBg: '#F6F2F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F1F8',
  segmented: '#EFE8F2',
  segmentedAdmin: '#EAE2EF',

  // Text
  ink: '#231B2E',
  inkSoft: '#3C3548',
  muted: '#5E5870',

  // Lines
  border: '#E6DFE9',
  borderStrong: '#CFC6D6',
  divider: '#F1EAF5',
  tabBorder: '#EDE6F0',
  promptBorder: '#D9CCE3',

  // Status
  success: '#0F6B4F',
  successDeep: '#0B5640',
  successSoft: '#E3F3EC',
  danger: '#B33A1B',
  dangerDeep: '#8A2D14',
  dangerInk: '#6B1F0B',
  dangerSoft: '#FFF1EC',
  dangerBorder: '#E9B8A6',
  warning: '#8A5A00',
  warningInk: '#5C3D00',
  warningSoft: '#FFF4DC',
  warningBorder: '#EBCB85',
  badge: '#E0577D',
  star: '#F2B63D',

  // Feature colours
  cycle: '#C2415F',
  cycleDeep: '#8A1F3D',
  cycleSoft: '#FBE3EA',
  water: '#1F7A91',
  waterDeep: '#145A6C',
  waterDark: '#175D70',
  waterSoft: '#DCF0F5',
  waterMist: '#E8F5F9',
  waterOnDark: '#CFEAF1',
  sleep: '#4B50C8',
  sleepDeep: '#2E3190',
  sleepSoft: '#ECEDFB',
  sleepLight: '#A9ACEB',
  peach: '#FFF0D9',
} as const;

/** Avatar tints used for doctors and patient aliases. */
export const tints = ['#EFE6F5', '#DCF0F5', '#FBE3EA', '#E3F3EC', '#FFF0D9', '#ECEDFB'] as const;

export const fontFamily = "'Plus Jakarta Sans', system-ui, sans-serif";

export type ColorName = keyof typeof colors;
