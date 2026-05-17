# 07 · Non-Functional Requirements

## 7.1 Performance (PERF)

### NFR-PERF-001 — Time to first interactive paint
- **Priority:** MUST.
- Authenticated dashboard renders **cached** content in ≤ **500 ms** on a
  mid-range Android device with cold cache + warm session.
- Cold cache target on 3G: ≤ **3 s**.

### NFR-PERF-002 — Optimistic writes
- **Priority:** MUST. Every log/mutation must reflect in the UI within **100 ms**
  of the tap, regardless of network state.

### NFR-PERF-003 — Bundle budgets
- **Priority:** SHOULD.
- Initial JS for the auth/landing entry ≤ **250 KB** gzipped.
- Each pillar-pillar lazy chunk ≤ **150 KB** gzipped.
- Quran reader chunk may exceed the per-chunk budget by 50% due to font and
  mushaf assets.

### NFR-PERF-004 — Database query response
- **Priority:** SHOULD. P95 server response ≤ **300 ms** for list pages
  bounded to 30 days.

### NFR-PERF-005 — Lighthouse score
- **Priority:** SHOULD. Landing page Lighthouse Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

## 7.2 Offline & connectivity (OFFLINE)

### NFR-OFFLINE-001 — Full offline read
- **Priority:** MUST. Every screen that has previously loaded data must render
  from localStorage cache when offline.

### NFR-OFFLINE-002 — Full offline write
- **Priority:** MUST. Mutations must queue locally and flush on reconnect.

### NFR-OFFLINE-003 — Network status UX
- **Priority:** MUST. `OfflineBanner` appears on disconnect; disappears on
  reconnect.

## 7.3 Accessibility (A11Y)

### NFR-A11Y-001 — WCAG 2.1 AA contrast
- **Priority:** MUST.

### NFR-A11Y-002 — Touch targets
- **Priority:** MUST. Minimum **44×44 pt** for all interactive elements.

### NFR-A11Y-003 — Keyboard navigation
- **Priority:** MUST on web. Tab order, visible focus, ESC closes modals.

### NFR-A11Y-004 — Screen-reader labels
- **Priority:** MUST. Every icon-only button has `aria-label`; live regions for
  toasts.

### NFR-A11Y-005 — Typography minimums
- **Priority:** MUST. Per `mem://ui/accessibility-standards`.

## 7.4 Internationalization (I18N)

### NFR-I18N-001 — Locale-aware dates and numbers
- **Priority:** MUST. Dates and numbers respect device locale.

### NFR-I18N-002 — Hijri date display
- **Priority:** MUST. Hijri shown alongside Gregorian where relevant.

### NFR-I18N-003 — RTL readiness
- **Priority:** SHOULD. Layout primitives use logical properties (`ms`/`me`).
  Arabic Quran content always renders RTL with the Uthmani font.

### NFR-I18N-004 — UI string translation
- **Priority:** `WON'T-for-MVP`. Planned post-launch: EN, MS, ID, AR per
  `docs/store-listings/localization-plan.md`.

## 7.5 Security (SEC)

### NFR-SEC-001 — RLS everywhere
- **Priority:** MUST. Every user-owned table has RLS enabled and policies tied
  to `auth.uid()`.

### NFR-SEC-002 — Server-side role checks
- **Priority:** MUST. Admin checks always go through `has_role()`. No
  client-side gating based on email lists or `localStorage` flags.

### NFR-SEC-003 — HIBP-protected passwords
- **Priority:** MUST. Supabase Auth HIBP check is enabled.

### NFR-SEC-004 — Secrets in env, never in code
- **Priority:** MUST. Server secrets are set via Lovable Cloud secrets;
  publishable keys may live in `.env`.

### NFR-SEC-005 — Audit log
- **Priority:** MUST. All admin mutations are audited.

### NFR-SEC-006 — Admin session timeout
- **Priority:** MUST. See `useAdminTimeout`.

### NFR-SEC-007 — Mobile admin block
- **Priority:** MUST. Admin routes are unreachable inside Capacitor.

## 7.6 Reliability (REL)

### NFR-REL-001 — Crash-free sessions
- **Priority:** SHOULD. ≥ **99.5 %** crash-free over a 7-day window.

### NFR-REL-002 — Backups
- **Priority:** MUST. Daily Supabase managed backups; tested restore at least
  once before each major release.

### NFR-REL-003 — Edge function timeouts
- **Priority:** MUST. Functions must complete within 5 s for interactive paths;
  long-running aggregations are deferred to scheduled jobs.

## 7.7 Observability (OBS)

### NFR-OBS-001 — Structured edge logs
- **Priority:** MUST. Edge functions log `request_id`, `user_id`, and outcome
  for every invocation.

### NFR-OBS-002 — Client error boundary telemetry
- **Priority:** SHOULD. `ErrorBoundary` reports unrecoverable errors to a log
  sink (manual review in MVP).

### NFR-OBS-003 — Admin live activity feed
- **Priority:** SHOULD. Recent `user_activity` entries visible to admins.

## 7.8 Maintainability (MAINT)

### NFR-MAINT-001 — Token-driven theming
- **Priority:** MUST. No raw hex/rgb in components; only semantic tokens.

### NFR-MAINT-002 — One source of routing
- **Priority:** MUST. All routes live in `src/App.tsx`.

### NFR-MAINT-003 — Hooks ↔ storage symmetry
- **Priority:** MUST. Every domain has a `use*Query` hook and a matching
  `*-storage.ts` adapter.

### NFR-MAINT-004 — No manual edits to generated files
- **Priority:** MUST. `src/integrations/supabase/client.ts` and `types.ts` are
  auto-generated.

### NFR-MAINT-005 — Tests for critical math
- **Priority:** SHOULD. Zakat, life-score, hijri, prayer-times, khatam math
  have unit tests under `src/test/*`.

## 7.9 Portability (PORT)

### NFR-PORT-001 — Single codebase
- **Priority:** MUST. Web and native share one React tree.

### NFR-PORT-002 — Native abstraction layer
- **Priority:** MUST. All Capacitor plugin calls go through `src/utils/native/*`.

### NFR-PORT-003 — PWA installable
- **Priority:** MUST. `/install` page guides PWA install; manifest and icons
  configured.

## 7.10 Legal & compliance (COMP)

### NFR-COMP-001 — Privacy policy + ToS
- **Priority:** MUST. Linked from app and stores (see `docs/store-listings/`).

### NFR-COMP-002 — Apple/Google data-safety disclosures
- **Priority:** MUST. Match `docs/store-listings/data-safety-android.md` and
  `app-privacy-ios.md`.

### NFR-COMP-003 — Age rating
- **Priority:** MUST. 4+ on iOS / Everyone on Play. No user-generated content
  shown to others in MVP except within explicit family groups.