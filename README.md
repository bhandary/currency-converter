# Currency Converter

A responsive MVP web app for converting between common currencies with live exchange rates.

## Features

- Amount input with source/target currency selectors
- Supported currencies: USD, EUR, GBP, INR, JPY, CAD, AUD
- One-click swap action
- Live conversion using the Frankfurter exchange-rate API
- Loading and error states
- Mobile-friendly responsive layout

## Tech Stack

- React + TypeScript + Vite
- Vitest for unit tests
- GitHub Actions for pull-request CI

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Available Scripts

```bash
npm run dev
npm run build
npm run test
npm run lint
```

## Exchange Rate Source

The app uses the public Frankfurter API:

- Docs: https://www.frankfurter.app/
- Endpoint used: `https://api.frankfurter.app/latest`

This is a free-tier-friendly public API for current exchange rates and requires no auth for this MVP.

## Notes

- Rates are fetched client-side at conversion time.
- If the exchange-rate service is unavailable, the app shows a clear error state.
- Historical charts, favorites, auth, and i18n are intentionally out of scope for this MVP.
