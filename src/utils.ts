export function roundCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatRate(rate: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(rate)
}

export function parseAmount(input: string): number {
  const normalized = Number(input)
  return Number.isFinite(normalized) && normalized > 0 ? normalized : 0
}
