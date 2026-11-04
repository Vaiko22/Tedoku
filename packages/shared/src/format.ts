export const formatNaira = (value: number) => '₦' + Math.round(value).toLocaleString('en-NG');

export const formatUsdc = (value: number) => value.toFixed(2) + ' USDC';

export const formatAmount = (value: number, rail: 'naira' | 'usdc') =>
  rail === 'naira' ? formatNaira(value) : formatUsdc(value);

/** "Dr. Ife Adeyemi" -> "IA" */
export const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.\s*/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

/** "0x4a7c19b2…e91d" style shortening for wallet addresses. */
export const shortAddress = (addr: string) => (addr.length > 12 ? addr.slice(0, 6) + '…' + addr.slice(-4) : addr);

export const isWalletAddress = (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr);

export const isEmail = (v: string) => /.+@.+\..+/.test(v.trim());

export const isPhone = (v: string) => v.replace(/\D/g, '').length >= 10;
