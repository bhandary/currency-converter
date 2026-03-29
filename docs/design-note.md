# Design Note

## Scope
Implement CC-1 as a focused MVP: a responsive single-page currency converter with live rate fetching and core UX states.

## Approach
- Build a lightweight React + TypeScript frontend with Vite for fast iteration.
- Fetch rates from `https://open.er-api.com/v6/latest/{base}` whenever the source currency changes.
- Keep state local to a single `App` component because the MVP scope is small.
- Cover the main path with unit/UI tests for success, swap behavior, and error handling.

## Trade-offs
- No backend in MVP to keep delivery fast and reviewable.
- Currency list is intentionally small and curated for the initial release.
- Uses a public exchange-rate endpoint, so production hardening can later add retries, caching, or a server-side proxy if needed.
