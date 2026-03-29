import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const fetchMock = vi.fn()

function mockSuccess(to: string, amount = 1, rate = 0.92) {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      amount,
      base: 'USD',
      date: '2026-03-28',
      rates: { [to]: rate },
    }),
  })
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('App', () => {
  it('renders a conversion result after a successful fetch', async () => {
    mockSuccess('EUR')

    render(<App />)

    expect(await screen.findByText(/1.00 USD =/i)).toBeInTheDocument()
    expect(screen.getByText(/0.9200 EUR/i)).toBeInTheDocument()
  })

  it('swaps selected currencies', async () => {
    mockSuccess('EUR')
    const user = userEvent.setup()

    render(<App />)

    await screen.findByText(/1.00 USD =/i)

    const fromSelect = screen.getByLabelText('From') as HTMLSelectElement
    const toSelect = screen.getByLabelText('To') as HTMLSelectElement

    expect(fromSelect.value).toBe('USD')
    expect(toSelect.value).toBe('EUR')

    await user.click(screen.getByRole('button', { name: 'Swap' }))

    await waitFor(() => {
      expect(fromSelect.value).toBe('EUR')
      expect(toSelect.value).toBe('USD')
    })
  })

  it('shows an error when fetch fails', async () => {
    fetchMock.mockResolvedValue({ ok: false })

    render(<App />)

    expect(
      await screen.findByText('Unable to fetch exchange rates right now.'),
    ).toBeInTheDocument()
  })

  it('handles same-currency conversion locally without calling the API', async () => {
    mockSuccess('EUR')
    const user = userEvent.setup()

    render(<App />)

    await screen.findByText(/1.00 USD =/i)
    await user.selectOptions(screen.getByLabelText('To'), 'USD')

    expect(await screen.findByText(/1.00 USD =/i)).toBeInTheDocument()
    expect(screen.getByText(/1.0000 USD/i)).toBeInTheDocument()
    expect(screen.getByText(/same-currency conversion/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows a loading state while waiting for conversion results', async () => {
    let resolveFetch: ((value: { ok: boolean; json: () => Promise<unknown> }) => void) | undefined
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )

    render(<App />)

    expect(await screen.findByText('Fetching latest exchange rate…')).toBeInTheDocument()

    resolveFetch?.({
      ok: true,
      json: async () => ({
        amount: 1,
        base: 'USD',
        date: '2026-03-28',
        rates: { EUR: 0.92 },
      }),
    })

    expect(await screen.findByText(/1.00 USD =/i)).toBeInTheDocument()
  })

  it('refreshes conversion when amount and selector values change on the critical path', async () => {
    fetchMock.mockImplementation(async (input: string | URL | Request) => {
      const url = new URL(input.toString())
      const amount = Number(url.searchParams.get('amount') ?? '1')
      const to = url.searchParams.get('to') ?? 'EUR'
      const rates: Record<string, number> = {
        EUR: 0.92,
        GBP: 3.95,
      }

      return {
        ok: true,
        json: async () => ({
          amount,
          base: 'USD',
          date: '2026-03-28',
          rates: { [to]: rates[to] },
        }),
      }
    })

    const user = userEvent.setup()
    render(<App />)

    await screen.findByText(/1.00 USD =/i)
    await user.clear(screen.getByLabelText('Amount'))
    await user.type(screen.getByLabelText('Amount'), '5')
    await user.selectOptions(screen.getByLabelText('To'), 'GBP')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.frankfurter.app/latest?amount=5&from=USD&to=GBP',
      )
    })

    expect(await screen.findByText(/5.00 USD =/i)).toBeInTheDocument()
    expect(screen.getByText(/3.95 GBP/i)).toBeInTheDocument()
    expect(screen.getByText(/0.7900 GBP/i)).toBeInTheDocument()
  })
})
