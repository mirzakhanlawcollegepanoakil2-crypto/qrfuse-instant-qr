# SaaS layer notes

- Static QR generation stays free and fully client-side (`src/components/qr`).
- Dynamic codes live in `dynamic_codes`; scans in `scans`.
- `/r/$slug` resolves and records a scan through the trusted `record_scan`
  routine (no IP is stored — only a daily-rotating hash).
- Premium gating: `entitlements` + `has_premium_access`; a 14-day trial can be
  claimed once via `start_trial`.
- Billing provider is not wired yet (Phase 4 decision pending).
