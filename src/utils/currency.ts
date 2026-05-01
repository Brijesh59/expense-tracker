export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
};

export function formatAmount(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (amount >= 1_00_000) {
    return `${symbol}${(amount / 1_00_000).toFixed(1)}L`;
  }
  if (amount >= 1_000) {
    return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return `${symbol}${amount}`;
}

export function formatAmountFull(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export const CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
