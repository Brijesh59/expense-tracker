import { useLumaStore } from '@/db/store';
import { formatAmount, formatAmountFull, CURRENCY_SYMBOLS, type CurrencyCode } from '@/utils/currency';

export function useCurrency() {
  const currency = useLumaStore(s => (s.settings['currency'] as CurrencyCode) ?? 'INR');
  const symbol = CURRENCY_SYMBOLS[currency];

  return {
    currency,
    symbol,
    format: (amount: number) => formatAmount(amount, currency),
    formatFull: (amount: number) => formatAmountFull(amount, currency),
  };
}
