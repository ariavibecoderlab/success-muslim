# Software Requirements Specification (SRS) — Success Muslim

This folder contains the complete Software Requirements Specification for the
**Success Muslim** application (appId `com.brainybunch.successmuslim`,
domain `successmuslim.app`).

It is written in the spirit of **IEEE Std 830-1998** but adapted to a modern,
offline-first React + Lovable Cloud (Supabase) + Capacitor product.

## How to read this SRS

| # | Document | What's inside |
|---|----------|---------------|
| 00 | [SRS Master](./00-srs-master.md) | One-page narrative overview that links to every section. Start here. |
| 01 | [Introduction](./01-introduction.md) | Purpose, scope, definitions, references. |
| 02 | [Overall Description](./02-overall-description.md) | Product perspective, user classes, constraints, assumptions. |
| 03 | [System Architecture](./03-system-architecture.md) | Frontend, Lovable Cloud, edge functions, native shell, diagrams. |
| 04 | [Functional Requirements](./04-functional-requirements.md) | Every feature, every screen, every rule. The longest section. |
| 05 | [Data Requirements](./05-data-requirements.md) | Entity model, RLS, sync, backdate, life-score formula. |
| 06 | [External Interfaces](./06-external-interfaces.md) | UI, API, 3rd parties (JAKIM, Aladhan, Google, Lovable AI), Capacitor plugins. |
| 07 | [Non-Functional Requirements](./07-non-functional-requirements.md) | Performance, offline, a11y, security, i18n, observability. |
| 08 | [Security & Privacy](./08-security-and-privacy.md) | AuthN/Z, roles, data classification, retention, compliance. |
| 09 | [Deployment & Release](./09-deployment-and-release.md) | Web, PWA, Android, iOS, env matrix, store submission. |
| 10 | [Traceability & Acceptance](./10-traceability-and-acceptance.md) | Requirement → file map, acceptance criteria, MVP scope. |

## Conventions

- **Requirement IDs** — `FR-<MODULE>-###` (functional), `NFR-<CATEGORY>-###` (non-functional).
- **Priority** — MoSCoW (`MUST`, `SHOULD`, `COULD`, `WON'T-for-MVP`).
- **Source** — every requirement names the file(s) of record, so requirements stay
  testable against the codebase.
- **Truth source** — when this SRS and the codebase disagree, the **codebase wins**
  and this SRS must be updated.

## Related docs

- Store submission kit → [`docs/store-listings/`](../store-listings/README.md)
- Mobile / Capacitor → [`docs/MOBILE_CAPACITOR_CHECKLIST.md`](../MOBILE_CAPACITOR_CHECKLIST.md)
- Native plugins → [`docs/NATIVE_PLUGINS_GUIDE.md`](../NATIVE_PLUGINS_GUIDE.md)
- Supabase / backend → [`docs/SUPABASE_MIGRATION.md`](../SUPABASE_MIGRATION.md)

---

**Document owner:** Brainy Bunch (publisher) · **Version:** 1.0 · **Status:** Baselined for MVP launch (1 Ramadan 1447 AH).