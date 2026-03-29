import type { CurrencyCode } from './currencies';

export type RatesResponse = {
  base_code: CurrencyCode;
  conversion_rates: Record<string, number>;
};

export async function fetchRates(base: CurrencyCode): Promise<RatesResponse> {
  const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);

  if (!response.ok) {
    throw new Error('Unable to load exchange rates right now.');
  }

  const data = (await response.json()) as {
    result?: string;
    base_code?: CurrencyCode;
    rates?: Record<string, number>;
  };

  if (data.result !== 'success' || !data.base_code || !data.rates) {
    throw new Error('Exchange rate data was unavailable.');
  }

  return {
    base_code: data.base_code,
    conversion_rates: data.rates
  };
}
