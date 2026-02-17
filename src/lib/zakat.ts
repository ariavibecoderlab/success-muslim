export interface ZakatInput {
  cash: number;
  goldGrams: number;
  silverGrams: number;
  investments: number;
  otherAssets: number;
  debts: number;
  currency: string;
}

export interface ZakatResult {
  id: string;
  input: ZakatInput;
  totalWealth: number;
  netZakatable: number;
  zakatAmount: number;
  nisabGold: number;
  nisabSilver: number;
  meetsNisab: boolean;
  date: string;
}

// Approximate prices per gram (these serve as defaults; user can override)
const GOLD_PRICE_PER_GRAM = 350; // ~MYR
const SILVER_PRICE_PER_GRAM = 4;
const NISAB_GOLD_GRAMS = 85;
const NISAB_SILVER_GRAMS = 595;

export const CURRENCIES = ['MYR', 'USD', 'SAR', 'GBP', 'EUR', 'IDR', 'SGD', 'AED'] as const;

export function calculateZakat(
  input: ZakatInput,
  goldPrice = GOLD_PRICE_PER_GRAM,
  silverPrice = SILVER_PRICE_PER_GRAM
): ZakatResult {
  const goldValue = input.goldGrams * goldPrice;
  const silverValue = input.silverGrams * silverPrice;
  const totalWealth = input.cash + goldValue + silverValue + input.investments + input.otherAssets;
  const netZakatable = Math.max(0, totalWealth - input.debts);

  const nisabGold = NISAB_GOLD_GRAMS * goldPrice;
  const nisabSilver = NISAB_SILVER_GRAMS * silverPrice;
  const meetsNisab = netZakatable >= Math.min(nisabGold, nisabSilver);

  return {
    id: Date.now().toString(36),
    input,
    totalWealth,
    netZakatable,
    zakatAmount: meetsNisab ? netZakatable * 0.025 : 0,
    nisabGold,
    nisabSilver,
    meetsNisab,
    date: new Date().toISOString().split('T')[0],
  };
}

const HISTORY_KEY = 'zakat_history';

export function getZakatHistory(): ZakatResult[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveZakatResult(result: ZakatResult) {
  const history = getZakatHistory();
  history.unshift(result);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}
