# QRFuse Audit + Phased Plan to Premium QR SaaS

No production code changed. Findings below come from reading the routes, components, server functions, and the live database policies.

## What exists today

**Frontend / routes** (TanStack Start, file routes in `src/routes`)
- `/` static generator, `/blog`, `/blog/$slug`, `/contact`, `/privacy`, `/terms`, `/admin`, plus `sitemap.xml`, `rss.xml`, and an image proxy at `/api/public/blog-image/$`.
- Generator stack: `qr-types.ts` (10 types: url, text, wifi, email, phone, sms, vcard, location, whatsapp, social), `qr-style.ts` (colors, gradients, dot/eye styles, 4 templates), `qr-export.ts` (PNG/SVG/PDF + frames), `QrGenerator/QrPreview/CustomizePanel/TypeTabs/Field`. Fully client-side via `qr-code-styling`. This is the strongest asset in the codebase and must stay untouched and free.
- Full shadcn/ui library present but barely used; header/footer/layout components exist.
- SEO: per-route `head()`, `src/lib/seo.ts` with OG + JSON-LD helpers, DB-driven sitemap and RSS, robots.txt, GA (G-ZYNWCK2CZG) in `__root.tsx`. Canonical base is `https://qrfuse.vercel.app`.

**Backend (Lovable Cloud / Postgres)**
- Tables: `blog_posts`, `qr_events` (id, qr_type, created_at), `user_roles` + `app_role` enum ('admin' only) + `has_role()` security-definer function.
- RLS is enabled everywhere with sane policies: published posts public, admin-only CRUD, anon insert on `qr_events`, own-row read on `user_roles`.
- Admin server functions in `src/lib/admin.functions.ts` guarded by `requireVercelCompatibleAuth` (bearer token validated server-side) + `assertAdmin`. Bearer attached globally in `src/start.ts`. No service-role key in client code.

**Auth**
- Email/password only, no signup surface, single admin account. `/admin` is `ssr: false`, client-gated, and re-verified server-side per call. There is no end-user account system at all.

## Gaps blocking a SaaS

1. **No user accounts or ownership model.** Nothing is user-scoped; there is no `profiles`, no plan/subscription state, no saved QR codes. This is the single biggest missing piece.
2. **No dynamic QR primitive.** No short-link table, no redirect route, no destination editing. Dynamic QR is the entire paid value.
3. **Analytics are anonymous and unattributable.** `qr_events` has no user id, no qr id, and no scan concept — it only counts generator clicks. It cannot become scan analytics as-is; it needs a separate `scans` table.
4. **No trial/entitlement enforcement.** Any premium gate must be enforced server-side (redirect + edit paths), not in UI only.
5. **`app_role` has only `admin`.** Plans must NOT live on a profile row users can update; entitlements need their own table with no user-writable path.
6. **No abuse controls on public writes.** Anon insert on `qr_events` and a future public redirect endpoint both need rate limiting / bot filtering, and scan logging must avoid storing raw IPs (hash + coarse geo only) for GDPR.
7. **Brand coupling.** `qrfuse` strings are hardcoded in `seo.ts`, robots, RSS, and copy. No rename now, but Phase 1 should route brand strings through one config module so a later rebrand is a one-file change.

## Recommended phase order

**Phase 0 — Foundation, no user-visible change**
- Centralize brand/domain strings into a single config module (no rename).
- Add `profiles` + `plans`/`entitlements` tables with strict RLS (read-own, no user writes to plan fields), keeping `user_roles` as-is for admin.
- Keep the static generator byte-for-byte functional; add regression checks around it.

**Phase 1 — Accounts**
- Public `/auth` (email/password + Google) and a protected `_authenticated/` subtree; `/dashboard` as the signed-in home. `/` stays public and free.
- `profiles` auto-created on signup via trigger. Sign-in state reflected in the header.

**Phase 2 — Dynamic QR core (the paid primitive)**
- `dynamic_qrs` table: owner, slug, destination URL, name, active flag, style JSON, timestamps. Owner-scoped RLS; public read limited to slug→destination for active rows only.
- Public redirect route `/r/$slug` (server route, 302, no SSR page) that resolves destination and fires a scan insert.
- Dashboard CRUD: create dynamic QR, edit destination without reprinting, pause/activate, reuse the existing style/export pipeline for the encoded short URL.

**Phase 3 — Scan analytics**
- `scans` table: qr id, timestamp, hashed IP, coarse country, device/UA class, referrer. Never store raw IP.
- Aggregated per-QR charts (scans over time, top country, device split) using the already-installed chart component; server-side aggregation so raw rows stay private.

**Phase 4 — Trial / Pro gating and monetization**
- Trial window and quota per account (e.g. N dynamic QRs, 14-day trial) enforced in the server functions that create/edit dynamic QRs and in the redirect (expired trial → branded upgrade page, not a broken scan).
- Pricing page, upgrade flow, billing provider integration (needs your decision), plan state written only by verified webhooks.

**Phase 5 — Growth polish**
- Rebrand decision applied through the Phase 0 config module, marketing pages, per-route SEO for new pages, migrate `qr_events` reporting into the new analytics model, admin panel views for accounts and plan states.

## Decisions I need from you

1. Billing provider for Phase 4 (Stripe vs. other) and trial shape (time-limited, quota-limited, or both).
2. Whether dynamic short links should live on the main domain (`/r/<slug>`) or a dedicated short domain — this affects the brand/domain strategy you want to evaluate.
3. Whether signup is open self-serve or waitlist-gated at launch.

## Technical notes

- All premium checks belong in `createServerFn` handlers plus RLS; route guards alone are cosmetic since the RPC endpoints stay callable.
- Redirects must be a server route (not a React page) so scans are fast and crawler-safe, and must degrade gracefully for unknown/paused slugs.
- `qr_events` stays as a legacy generator counter; do not overload it with scan data.
- Roles stay in `user_roles` via `has_role()`; plan/entitlement checks get their own security-definer helper for the same anti-escalation reason.
