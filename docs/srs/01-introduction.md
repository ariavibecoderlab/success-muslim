# 01 · Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the **complete behaviour
and constraints** of the Success Muslim application. It is the contract used by
product, engineering, QA, store-review, and operations to agree on what the
product must do for its **MVP launch on 1 Ramadan 1447 AH** and beyond.

The document captures:

- **What** the system must do (Functional Requirements, Section 04).
- **How well** it must do it (Non-Functional Requirements, Section 07).
- **What** it stores and exchanges (Data + External Interfaces, Sections 05–06).
- **How** it is built, deployed, and verified (Sections 03, 09, 10).

## 1.2 Scope

### 1.2.1 In scope

- A consumer-facing, mobile-first Islamic lifestyle app delivered as:
  - a **Progressive Web App** at `https://successmuslim.app`,
  - a **native Android app** (Capacitor + Android 8.x SDK), and
  - a **native iOS app** (Capacitor + iOS).
- A **Lovable Cloud (Supabase)** backend providing:
  - email + Google OAuth authentication,
  - a relational data store with row-level security,
  - edge functions exposed under the `api-*` prefix,
  - file storage for dakwah posters, blog images, and CMS overrides.
- A web-only **Admin Console** for staff (users, analytics, families, audit log,
  announcements, dakwah, blog, system).
- A **content / blog CMS** for community articles (Tiptap-based).
- A **marketing surface** (`/home`, `/features`, `/about`, `/install`, `/blog`).

### 1.2.2 Out of scope for MVP

- Dark mode.
- In-app purchases, subscriptions, or paid plans.
- Push notifications via FCM/APNs from the server (MVP uses **local** notifications only).
- Real-time chat between family members (activity feed only).
- Apple Watch / Wear OS companions.
- Auto-imported step / sleep / weight data from HealthKit, Google Fit, or wearables.
- Multi-language UI **strings** (i18n infrastructure is planned, see Localization Plan; MVP ships English with Quran in Uthmani Arabic).

## 1.3 Definitions, acronyms, and abbreviations

| Term | Meaning |
|------|---------|
| **Adhan** | Islamic call to prayer; in-app refers to optional audio alert + notification at prayer time. |
| **Aladhan** | Public global prayer-times API used outside Malaysia. |
| **Ayah** | A verse of the Quran. |
| **Backdate window** | The 90-day universal allowance to log past activities. |
| **CMS overrides** | Admin-editable text, image, and icon overrides stored in `page_overrides`. |
| **Deen** | Religion / faith; used interchangeably with "Iman" in the codebase routes (`/iman` vs `pages/deen/*`). |
| **Dhikr** | Remembrance of Allah; the counter records sessions of repetitions. |
| **Edge Function** | Supabase Deno function deployed under `supabase/functions/api-*`. |
| **Fidyah** | Compensation for missed obligatory fasts that cannot be made up. |
| **HIBP** | Have-I-Been-Pwned password breach check, enabled at the Supabase Auth level. |
| **IF** | Intermittent fasting (the **health** module, not the Ramadan/Islamic fast). |
| **JAKIM** | Jabatan Kemajuan Islam Malaysia; provides Malaysian prayer-time zones via `jakim-proxy`. |
| **Khatam** | Completion of reading the entire Quran. |
| **Life Score** | Composite daily score combining Iman, Wellness, and Productivity scores. |
| **Lovable AI** | Lovable AI Gateway providing access to Gemini, GPT-5, etc., without user-supplied keys. |
| **Lovable Cloud** | Managed Supabase backend wired to the project. Referred to as "the backend" in user-facing copy. |
| **PWA** | Progressive Web App. |
| **Qada / Qada Solat** | Make-up prayers for missed obligatory solat. |
| **Qiyam** | Voluntary night prayer. |
| **RLS** | PostgreSQL Row-Level Security. |
| **RBAC** | Role-based access control. |
| **Sadaqah** | Voluntary charity. |
| **Salah / Solat** | The five daily obligatory prayers. |
| **Sunnah** | Recommended but non-obligatory practices (e.g., extra prayers, fasts). |
| **Zakat** | Obligatory alms (2.5% above nisab). |

## 1.4 References

- IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications.
- WCAG 2.1 AA.
- Apple Human Interface Guidelines.
- Material Design 3 (Android shell baseline).
- Google Play Developer Policy Center.
- Apple App Store Review Guidelines.
- JAKIM e-Solat zone list (mirrored in `src/lib/jakim-zones.ts`).
- Aladhan API (`https://api.aladhan.com/v1`).
- Capacitor 8 documentation.
- Project memory index — `mem://index.md` and child notes.
- Store submission kit — [`docs/store-listings/`](../store-listings/README.md).

## 1.5 Document conventions

- **Requirement IDs** use the form `FR-<MODULE>-###` for functional and
  `NFR-<CATEGORY>-###` for non-functional. IDs are stable; if a requirement is
  removed the ID is retired, never reused.
- **Priority** uses MoSCoW: `MUST`, `SHOULD`, `COULD`, `WON'T-for-MVP`.
- **Source** is the authoritative file path(s) in the repository. If this SRS
  and the source disagree, the source wins and this SRS must be corrected.
- Code paths use backticks (e.g., `src/pages/deen/QuranReader.tsx`).
- Database tables use unquoted lowercase (e.g., `quran_reading_log`).

## 1.6 Overview of the rest of the document

Section 02 introduces the product context and user classes. Section 03 lays out
the architecture. Section 04 is the catalogue of functional requirements,
organized by module. Sections 05–08 cover data, external interfaces, NFRs, and
security. Section 09 covers deployment. Section 10 closes with traceability and
MVP acceptance criteria.