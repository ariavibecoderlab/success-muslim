## Plan: Software Requirements Specification (SRS)

Create a comprehensive, IEEE 830-style SRS for the Success Muslim app, written from the current codebase (routes, hooks, Supabase schema, edge functions, mobile/Capacitor setup, admin, CMS, etc.).

### Deliverable

A single master document plus focused appendices under `docs/srs/`:

```
docs/srs/
├── README.md                          # Index + how to read this SRS
├── 00-srs-master.md                   # Full SRS (sections 1–10, IEEE 830 style)
├── 01-introduction.md                 # Purpose, scope, definitions, references
├── 02-overall-description.md          # Product perspective, users, constraints, assumptions
├── 03-system-architecture.md          # Frontend (React/Vite), Lovable Cloud (Supabase),
│                                      # Edge Functions, Capacitor native, data flow diagrams
├── 04-functional-requirements.md      # FR-### per module:
│                                      #   Auth, Onboarding, Dashboard/Today, Iman
│                                      #   (Prayer, Quran, Dhikr, Sunnah, Sadaqah, Zakat,
│                                      #    Fidyah, Qada, Ramadhan Qada, Qiyam, Hajj,
│                                      #    Dakwah, Salah Log, Fasting),
│                                      #   Health (BMI, Weight, Hydration, Sleep,
│                                      #    Fasting/IF, Steps), Wealth (Budget, Savings,
│                                      #    Income Sources), Productivity (Tasks, Habits,
│                                      #    Life Areas), Family/Class groups,
│                                      #   Blog/CMS, Admin Console, Settings
├── 05-data-requirements.md            # ER overview, table-by-table contract,
│                                      # RLS policies, security definer functions,
│                                      # offline-first sync (localStorage ↔ Supabase),
│                                      # backdate (90-day) rules, life-score formula
├── 06-external-interfaces.md          # UI (mobile-first max-w-md), API surface
│                                      # (edge functions api-*), 3rd-party (JAKIM/Aladhan,
│                                      # Google OAuth, Lovable AI Gateway), Capacitor plugins
├── 07-non-functional-requirements.md  # Performance, offline, accessibility (WCAG 2.1 AA,
│                                      # Apple HIG, 44x44 targets), security (RBAC,
│                                      # HIBP), i18n (EN/MS/ID/AR), reliability,
│                                      # observability, maintainability
├── 08-security-and-privacy.md         # AuthN/AuthZ, roles (admin/moderator/user),
│                                      # data classification, retention, GDPR/PDPA,
│                                      # store privacy declarations
├── 09-deployment-and-release.md       # Web (Lovable), PWA, Android/iOS via Capacitor,
│                                      # appId com.brainybunch.successmuslim, env matrix
└── 10-traceability-and-acceptance.md  # Requirement → feature/file traceability,
                                       # acceptance criteria, MVP scope for 1 Ramadan 1447 AH
```

### Method

1. Audit the codebase in read-only mode to extract truth:
   - Routes from `src/App.tsx`
   - Hooks under `src/hooks/*` and storage libs under `src/lib/*`
   - Edge functions under `supabase/functions/api-*`
   - Supabase types (`src/integrations/supabase/types.ts`) for entity model
   - Memory files under `mem://features/*`, `mem://tech/*`, `mem://ui/*` for canonical rules
2. Write each section with concrete IDs:
   - Functional: `FR-IMAN-001`, `FR-HEALTH-IF-004`, etc.
   - Non-functional: `NFR-PERF-001`, `NFR-A11Y-002`, etc.
   - Each requirement: ID · Title · Description · Inputs/Outputs · Preconditions ·
     Acceptance criteria · Source file(s) · Priority (MoSCoW).
3. Cross-link to existing docs in `docs/store-listings/*` and `docs/MOBILE_*` rather than duplicating.
4. Keep visuals as ASCII diagrams (architecture, sync flow, auth flow).

### Out of scope

- No code changes, no schema changes, no new routes.
- No marketing copy (lives in `docs/store-listings/`).
- No test plan (can be a follow-up `docs/test-plan/`).

### Confirm before I proceed

- Language: **English** (consistent with existing `docs/`), OK? Or do you want it in **Bahasa Melayu**?
- Depth: produce the **full split set above** (10 files + index), or only the **single `00-srs-master.md`** as one long doc?
