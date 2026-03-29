import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('App', () => {
  it('renders a conversion result after a successful fetch', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        amount: 1,
        base: 'USD',
        date: '2026-03-28',
        rates: { EUR: 0.92 },
      }),
    })

    render(<App />)

    expect(await screen.findByText(/1.00 USD =/i)).toBeInTheDocument()
    expect(screen.getByText(/0.9200 EUR/i)).toBeInTheDocument()
  })

  it('swaps selected currencies', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        amount: 1,
        base: 'USD',
        date: '2026-03-28',
        rates: { EUR: 0.92 },
      }),
    })

    render(<App />)

    const fromSelect = screen.getByLabelText('From') as HTMLSelectElement
    const toSelect = screen.getByLabelText('To') as HTMLSelectElement

    expect(fromSelect.value).toBe('USD')
    expect(toSelect.value).toBe('EUR')

    fireEvent.click(screen.getByRole('button', { name: 'Swap' }))

    expect(fromSelect.value).toBe('EUR')
    expect(toSelect.value).toBe('USD')
  })

  it('shows an error when fetch fails', async () => {
    fetchMock.mockResolvedValue({ ok: false })

    render(<App />)

    expect(
      await screen.findByText('Unable to fetch exchange rates right now.'),
    ).toBeInTheDocument()
  })
})
