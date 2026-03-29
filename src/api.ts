import type { CurrencyCode } from './constants'

type ApiResponse = {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

export type ConversionResult = {
  amount: number
  from: CurrencyCode
  to: CurrencyCode
  convertedAmount: number
  rate: number
  date: string
}

export async function fetchConversion(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): Promise<ConversionResult> {
  const params = new URLSearchParams({
    amount: amount.toString(),
    from,
    to,
  })

  const response = await fetch(`https://api.frankfurter.app/latest?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Unable to fetch exchange rates right now.')
  }

  const data = (await response.json()) as ApiResponse
  const rate = data.rates[to]

  if (typeof rate !== 'number') {
    throw new Error('Exchange rate data was incomplete.')
  }

  return {
    amount,
    from,
    to,
    convertedAmount: rate,
    rate: rate / amount,
    date: data.date,
  }
}
