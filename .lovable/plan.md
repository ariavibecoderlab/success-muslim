## Goal

Produce a complete, IEEE 1016-style **Software Design Specification (SDS)** for Success Muslim, complementing the existing SRS in `docs/srs/`. The SDS describes **how** the system is built (architecture, modules, data, interfaces, algorithms), where the SRS describes **what** it must do.

No code, schema, routes, or UI changes. Documentation only.

## Deliverable

A new folder `docs/sds/` with a master document plus focused chapters:

```text
docs/sds/
├── README.md                       Index + reading order, cross-links to SRS
├── 00-sds-master.md                Single long-form SDS (all chapters concatenated)
├── 01-introduction.md              Purpose, scope, audience, definitions, relationship to SRS
├── 02-design-overview.md           Design goals, constraints, principles, key trade-offs
├── 03-system-architecture.md       C4-style context + container view, runtime topology
│                                   (React SPA, Capacitor shell, Supabase Postgres,
│                                   Edge Functions, JAKIM/Aladhan, Google OAuth, Lovable AI)
├── 04-module-decomposition.md      Frontend module map: pages, components, hooks, lib,
│                                   stores, contexts, utils/native, integrations
├── 05-data-design.md               Logical schema by domain, ER notes, RLS pattern,
│                                   indexing strategy, storage buckets, retention
├── 06-interface-design.md          Internal API contracts (edge function envelopes,
│                                   request/response shapes), external API adapters
│                                   (JAKIM proxy, Aladhan, Google), Capacitor bridge surface
├── 07-component-design.md          Per-module detailed design: responsibilities,
│                                   public surface, dependencies, state, error paths
│                                   for Auth, Onboarding, Dashboard, Iman (Prayer, Quran,
│                                   Dhikr, Sunnah, Sadaqah/Zakat/Fidyah, Qada, Ramadhan
│                                   Qada, Qiyam, Hajj/Umrah, Dakwah, Salah Log, Fasting),
│                                   Health, Wealth, Productivity, Family, Blog/CMS,
│                                   Admin Console, Settings
├── 08-algorithms-and-logic.md      Life Score formula, Khatam math, prayer-time
│                                   calculation method selection, IF timer state machine,
│                                   streak/backdate rules, leaderboard scoring,
│                                   offline sync queue + conflict resolution
├── 09-ui-design.md                 Design system tokens, layout shells (AppLayout,
│                                   SubPageLayout, MarketingLayout), navigation pattern,
│                                   accessibility, motion, edit-mode CMS overlay
├── 10-state-and-data-flow.md       AuthContext, React Query, Zustand stores,
│                                   localStorage cache contract, db-sync lifecycle,
│                                   sequence diagrams (login, log salah offline,
│                                   start IF session, Quran session persist)
├── 11-security-design.md           AuthZ via has_role, RBAC, RLS templates,
│                                   admin guard + timeout, audit log, secrets handling,
│                                   threat model summary
├── 12-deployment-design.md         Web (Lovable host + custom domain), PWA,
│                                   Android (Capacitor + App Links + assetlinks.json),
│                                   iOS (Capacitor + Universal Links + AASA),
│                                   environments, release channels
├── 13-error-handling-and-observability.md
│                                   ErrorBoundary, toast taxonomy, edge function error
│                                   envelope, admin live activity feed, audit log,
│                                   client logging strategy
├── 14-performance-design.md        Bundle/code-split strategy, image policy,
│                                   query caching, list virtualization, Quran pagination
│                                   + Intersection Observer, memoization rules
├── 15-testing-design.md            Vitest setup, unit vs integration scope,
│                                   smoke-test mapping to SRS §10, manual QA matrix
└── 16-traceability.md              SRS requirement ID → SDS section → source file(s)
```

## Method

1. Audit the codebase to extract the actual design (do not invent):
   - `src/App.tsx`, `src/main.tsx`, `src/contexts/*`, `src/components/AppLayout.tsx`,
     `src/components/BottomNav.tsx`, `SubPageLayout.tsx`, `AuthGuard.tsx`, `AdminGuard.tsx`.
   - `src/hooks/use*Query.ts`, `src/lib/api-client.ts`, `src/lib/db-sync.ts`,
     all `src/lib/*-storage.ts`, `src/lib/life-score.ts`, `src/lib/quran-mapping.ts`,
     `src/lib/prayer-times.ts`, `src/lib/zakat.ts`, `src/stores/*`.
   - `src/utils/native/*` for the Capacitor abstraction surface.
   - `supabase/functions/*/index.ts` for edge function contracts.
   - `src/integrations/supabase/types.ts` for the authoritative schema.
   - `tailwind.config.ts`, `src/index.css` for the token surface.
   - `capacitor.config.ts`, `public/.well-known/*`, `public/_redirects`, `android/`, `ios/`.
2. Cross-link each SDS section back to the matching SRS section (`FR-*`, `NFR-*`).
3. Document sequence flows as fenced ASCII diagrams (no emojis).
4. Keep the SRS as source of truth for **requirements**; if SDS and SRS disagree, SRS wins for *what*, SDS wins for *how*, and code wins over both.

## Out of scope

- No code, schema, route, edge function, or UI changes.
- No new marketing copy, store-listing edits, or test code.
- No duplication of memory contents (Life Score weights, etc.) — reference `mem://` notes.

## Open question

Same as SRS: produce the **full split set above (17 files)**, or only a **single `00-sds-master.md`** long-form doc? Default if you don't answer: full split set, in English, matching the SRS structure.
