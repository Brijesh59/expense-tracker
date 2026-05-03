export type CurrencyCode =
  | 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED'
  | 'JPY' | 'CNY' | 'CAD' | 'AUD' | 'CHF'
  | 'SGD' | 'HKD' | 'KRW' | 'MXN' | 'BRL'
  | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK'
  | 'HUF' | 'TRY' | 'SAR' | 'QAR' | 'KWD'
  | 'BHD' | 'OMR' | 'EGP' | 'ZAR' | 'NGN'
  | 'THB' | 'IDR' | 'MYR' | 'PHP' | 'PKR'
  | 'BDT' | 'LKR' | 'NPR' | 'VND' | 'NZD'
  | 'CLP' | 'COP' | 'ARS';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCY_LIST: Currency[] = [
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee' },
  { code: 'USD', symbol: '$',    name: 'US Dollar' },
  { code: 'EUR', symbol: '€',    name: 'Euro' },
  { code: 'GBP', symbol: '£',    name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'CA$',  name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr',   name: 'Swiss Franc' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$',  name: 'Hong Kong Dollar' },
  { code: 'KRW', symbol: '₩',    name: 'South Korean Won' },
  { code: 'MXN', symbol: 'MX$',  name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real' },
  { code: 'SEK', symbol: 'kr',   name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr',   name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr',   name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł',   name: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč',   name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft',   name: 'Hungarian Forint' },
  { code: 'TRY', symbol: '₺',    name: 'Turkish Lira' },
  { code: 'SAR', symbol: '﷼',    name: 'Saudi Riyal' },
  { code: 'QAR', symbol: 'QR',   name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'KD',   name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: 'BD',   name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'EGP', symbol: 'E£',   name: 'Egyptian Pound' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand' },
  { code: 'NGN', symbol: '₦',    name: 'Nigerian Naira' },
  { code: 'THB', symbol: '฿',    name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp',   name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM',   name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱',    name: 'Philippine Peso' },
  { code: 'PKR', symbol: '₨',    name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳',    name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs',   name: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: 'रू',   name: 'Nepalese Rupee' },
  { code: 'VND', symbol: '₫',    name: 'Vietnamese Dong' },
  { code: 'NZD', symbol: 'NZ$',  name: 'New Zealand Dollar' },
  { code: 'CLP', symbol: 'CL$',  name: 'Chilean Peso' },
  { code: 'COP', symbol: 'CO$',  name: 'Colombian Peso' },
  { code: 'ARS', symbol: 'AR$',  name: 'Argentine Peso' },
];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = Object.fromEntries(
  CURRENCY_LIST.map(c => [c.code, c.symbol])
) as Record<CurrencyCode, string>;

export const CURRENCIES: CurrencyCode[] = CURRENCY_LIST.map(c => c.code);

export function formatAmount(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'INR') {
    if (amount >= 1_00_000) return `${symbol}${(amount / 1_00_000).toFixed(1)}L`;
    if (amount >= 1_000) return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    return `${symbol}${amount}`;
  }
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return `${symbol}${amount}`;
}

export function formatAmountFull(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return `${symbol}${amount.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
}
