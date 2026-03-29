import { useEffect, useMemo, useState } from 'react';
import { fetchRates } from './api';
import { currencies, type CurrencyCode } from './currencies';

function formatCurrency(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export default function App() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('EUR');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRates() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchRates(fromCurrency);
        if (!cancelled) {
          setRates(response.conversion_rates);
        }
      } catch (loadError) {
        if (!cancelled) {
          setRates(null);
          setError(loadError instanceof Error ? loadError.message : 'Something went wrong.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRates();

    return () => {
      cancelled = true;
    };
  }, [fromCurrency]);

  const numericAmount = Number(amount);
  const conversionRate = rates?.[toCurrency] ?? null;

  const convertedAmount = useMemo(() => {
    if (!conversionRate || Number.isNaN(numericAmount)) {
      return null;
    }

    return numericAmount * conversionRate;
  }, [conversionRate, numericAmount]);

  const canShowResult = convertedAmount !== null && amount !== '';

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  return (
    <main className="app-shell">
      <section className="converter-card">
        <p className="eyebrow">CC-1 MVP</p>
        <h1>Currency Converter</h1>
        <p className="subtitle">Convert between major currencies with live exchange rates.</p>

        <div className="field-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="selectors-row">
          <div className="field-group">
            <label htmlFor="fromCurrency">From</label>
            <select
              id="fromCurrency"
              name="fromCurrency"
              value={fromCurrency}
              onChange={(event) => setFromCurrency(event.target.value as CurrencyCode)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="swap-button" onClick={handleSwap}>
            Swap
          </button>

          <div className="field-group">
            <label htmlFor="toCurrency">To</label>
            <select
              id="toCurrency"
              name="toCurrency"
              value={toCurrency}
              onChange={(event) => setToCurrency(event.target.value as CurrencyCode)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="status-panel" aria-live="polite">
          {isLoading && <p>Loading live exchange rates…</p>}
          {!isLoading && error && <p className="error-message">{error}</p>}
          {!isLoading && !error && conversionRate && canShowResult && (
            <>
              <p className="result-text">
                {formatCurrency(numericAmount, fromCurrency)} ={' '}
                <strong>{formatCurrency(convertedAmount, toCurrency)}</strong>
              </p>
              <p className="rate-text">
                1 {fromCurrency} = {conversionRate.toFixed(4)} {toCurrency}
              </p>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
