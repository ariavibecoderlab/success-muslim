# 01 · Introduction

## 1.1 Purpose

This Software Design Specification (SDS) describes the realized design of
the Success Muslim application. It maps every requirement in the companion
SRS to concrete modules, data structures, interfaces, and algorithms so
that an engineer can navigate the codebase, extend it safely, or rebuild
a comparable system from the specification alone.

## 1.2 Scope

Covers the production system delivered for the MVP launch (target:
1 Ramadan 1447 AH):

- React 18 + Vite 5 single-page application served from `successmuslim.app`.
- Capacitor 6 native shells for Android (`com.brainybunch.successmuslim`)
  and iOS.
- Supabase Postgres (56 user-facing tables) with Row-Level Security.
- Supabase Edge Functions (`api-*`, `jakim-proxy`) for write paths and
  third-party proxying.
- Marketing site, PWA install path, and admin console embedded in the SPA.

Out of scope: paid tier billing, push to third-party watches, AI features
beyond the gateway abstraction, and any post-MVP modules.

## 1.3 Audience

- **Engineers** extending features or fixing defects.
- **Reviewers** auditing architecture, RLS, or accessibility.
- **Operators** preparing store submissions and release engineering.

## 1.4 Definitions

| Term | Meaning |
|------|---------|
| **Iman / Wellness / Wealth / Productivity** | Four life pillars used throughout the UI and scoring model. |
| **Khatam** | Completion of reading all 6,236 ayahs of the Qur'an. |
| **Adhan** | Audible call to prayer; here, an in-app/local notification trigger. |
| **IF** | Intermittent Fasting (non-religious, health pillar). |
| **Backdate** | Logging a past date; allowed for the last 90 days inclusive. |
| **App Links / Universal Links** | Verified deep links on Android/iOS. |
| **CMS overlay** | Admin-only `EditMode` for in-place editing of marketing surfaces. |
| **RLS** | Postgres Row-Level Security; primary authorization mechanism. |
| **`has_role()`** | Security-definer SQL function checking `user_roles`. |

## 1.5 Relationship to other documents

| Document | Role |
|----------|------|
| `docs/srs/*` | Requirements (what). Authoritative for behavior. |
| `docs/sds/*` | Design (how). This document. |
| `docs/store-listings/*` | Submission collateral. |
| `docs/MOBILE_*` | Capacitor conversion playbooks. |
| `mem://` notes | Living rules; cited but not duplicated. |
| `src/integrations/supabase/types.ts` | Generated schema; authoritative. |

## 1.6 Document status

Baseline aligned with the SRS baseline. Changes to design require updating
both this document and the relevant SRS section, or the source code if it
overrides both.