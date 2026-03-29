import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { fetchConversion } from './api'
import { CURRENCY_LABELS, SUPPORTED_CURRENCIES, type CurrencyCode } from './constants'
import { formatRate, parseAmount, roundCurrency } from './utils'

type ConversionState = {
  convertedAmount: number
  rate: number
  date: string
}

const DEFAULT_AMOUNT = '1'

function App() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD')
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('EUR')
  const [conversion, setConversion] = useState<ConversionState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parsedAmount = useMemo(() => parseAmount(amount), [amount])

  const handleConvert = useCallback(async () => {
    if (parsedAmount <= 0) {
      setError('Enter an amount greater than zero.')
      setConversion(null)
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await fetchConversion(parsedAmount, fromCurrency, toCurrency)
      setConversion({
        convertedAmount: result.convertedAmount,
        rate: result.rate,
        date: result.date,
      })
    } catch (requestError) {
      setConversion(null)
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while converting.',
      )
    } finally {
      setLoading(false)
    }
  }, [fromCurrency, parsedAmount, toCurrency])

  useEffect(() => {
    void handleConvert()
  }, [handleConvert])

  function handleSwap() {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setConversion(null)
    setError('')
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">CC-1 MVP</p>
          <h1>Currency Converter</h1>
          <p className="subtitle">
            Convert major currencies with live rates in a clean, responsive web app.
          </p>
        </div>

        <div className="converter-card">
          <div className="field-group">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="currency-grid">
            <div className="field-group">
              <label htmlFor="fromCurrency">From</label>
              <select
                id="fromCurrency"
                value={fromCurrency}
                onChange={(event) => setFromCurrency(event.target.value as CurrencyCode)}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency} — {CURRENCY_LABELS[currency]}
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
                value={toCurrency}
                onChange={(event) => setToCurrency(event.target.value as CurrencyCode)}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency} — {CURRENCY_LABELS[currency]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" className="convert-button" onClick={() => void handleConvert()} disabled={loading}>
            {loading ? 'Converting…' : 'Convert'}
          </button>

          <div className="status-panel" aria-live="polite">
            {error ? <p className="status error">{error}</p> : null}
            {!error && loading ? <p className="status loading">Fetching latest exchange rate…</p> : null}
            {!error && !loading && conversion ? (
              <div className="result-card">
                <p className="result-amount">
                  {roundCurrency(parsedAmount)} {fromCurrency} ={' '}
                  <strong>
                    {roundCurrency(conversion.convertedAmount)} {toCurrency}
                  </strong>
                </p>
                <p>
                  1 {fromCurrency} = {formatRate(conversion.rate)} {toCurrency}
                </p>
                <p className="result-date">Rates updated for {conversion.date}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
