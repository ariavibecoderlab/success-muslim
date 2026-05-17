# 02 · Design Overview

## 2.1 Design goals

1. **Spiritual focus first.** UI surfaces what a Muslim needs *today*
   (prayer, Qur'an, dhikr, fast) within one tap.
2. **Offline-first.** The app must function on patchy mobile networks
   during travel, i'tikaf, or hajj.
3. **Mobile-feel on every form factor.** A single `max-w-md` shell
   renders identically on phone, tablet, and desktop (with mockup frame).
4. **Single codebase, three targets.** Web, PWA, and Capacitor native
   shells share the same React tree; native concerns are abstracted in
   `src/utils/native/*`.
5. **Security by default.** Every table is RLS-locked; role checks use a
   security-definer function; admin operations require an additional
   guard and idle timeout.
6. **Low operational surface.** Lovable Cloud (managed Supabase) provides
   DB, auth, storage, and edge runtime — no self-hosted infrastructure.

## 2.2 Constraints

| Source | Constraint |
|--------|------------|
| Platform | React 18 + Vite 5 + TS 5 + Tailwind v3. No SSR. |
| Style | Light mode only for MVP; semantic tokens only; Hugeicons only. |
| Layout | `max-w-md` container on all authenticated screens. |
| Data | Supabase 1000-row default query limit. |
| Auth | Email/password + Google OAuth (Web application client). |
| Roles | Stored in `user_roles`, never on `profiles`. |
| Schema | `src/integrations/supabase/types.ts` is generated; never edit. |
| Native | Capacitor 6; appId `com.brainybunch.successmuslim`. |
| Budget | Indexed PWA install bundle ≤ ~2 MB gzipped for first paint. |

## 2.3 Principles

- **Read-through cache:** every hook returns localStorage immediately, then
  reconciles with the server via React Query.
- **Write-through queue:** every mutation persists to localStorage first
  and queues the network call; `db-sync` flushes on focus/online.
- **Edge functions own validation.** The client trusts no client; edge
  functions re-derive user identity from the JWT.
- **No raw colors in components.** All color/spacing goes through tokens
  in `src/index.css` + `tailwind.config.ts`.
- **History-aware navigation.** Back behavior respects the stack and
  segmented controls.
- **Backdating is universal.** Any log accepts `logged_for` within today − 90.

## 2.4 Key trade-offs

| Decision | Alternative | Why we chose it |
|----------|-------------|-----------------|
| Offline-first localStorage cache | Service Worker only | Synchronous reads, zero flash, simpler. |
| Edge functions for writes | Direct table writes | Centralized validation, audit, business rules. |
| Static Qur'an mapping (`src/lib/quran-mapping.ts`) | DB lookups | Zero-latency UI, deterministic, ships with bundle. |
| Capacitor over React Native | RN/Expo | Reuse identical SPA, faster MVP, one DOM. |
| `max-w-md` everywhere | Responsive desktop layout | Mobile-feel parity, predictable QA matrix. |
| Light mode only | Light + dark | Smaller token set, MVP scope; dark deferred. |
| `verify_jwt = false` on `jakim-proxy` only | Auth-gated proxy | Public landing needs prayer times pre-login. |

## 2.5 Quality attributes

| Attribute | Strategy |
|-----------|----------|
| Performance | Code splitting per route, localStorage prime, React Query dedupe. |
| Reliability | Idempotent upserts keyed by client UUID + `updated_at`. |
| Security | RLS on every table; `has_role()`; admin guard + idle timeout. |
| Accessibility | WCAG 2.1 AA contrast, 44×44 tap targets, aria-labels. |
| Portability | `src/utils/native/*` wraps every Capacitor plugin. |
| Maintainability | Domain hooks (`use*Query`) hide storage + sync details. |