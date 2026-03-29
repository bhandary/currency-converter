import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders converted results from live-rate data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'success',
        base_code: 'USD',
        rates: {
          USD: 1,
          EUR: 0.9
        }
      })
    } as Response);

    render(<App />);

    expect(screen.getByText(/loading live exchange rates/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/1 USD = 0.9000 EUR/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/\$1\.00 =/i)).toBeInTheDocument();
  });

  it('supports swapping currencies', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'success',
        base_code: 'USD',
        rates: {
          USD: 1,
          EUR: 0.9
        }
      })
    } as Response);

    render(<App />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText(/1 USD = 0.9000 EUR/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /swap/i }));

    await waitFor(() => {
      expect((screen.getByLabelText(/from/i) as HTMLSelectElement).value).toBe('EUR');
    });

    expect((screen.getByLabelText(/to/i) as HTMLSelectElement).value).toBe('USD');
  });

  it('shows an error state when rates fail to load', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false
    } as Response);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load exchange rates right now/i)).toBeInTheDocument();
    });
  });
});
