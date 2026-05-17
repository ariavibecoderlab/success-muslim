# Software Design Specification (SDS)

**Project:** Success Muslim
**App ID:** `com.brainybunch.successmuslim`
**Domain:** https://successmuslim.app
**Standard:** IEEE 1016-2009 (adapted)
**Companion document:** [Software Requirements Specification](../srs/README.md)

The SRS answers **what** the system must do. The SDS answers **how** it is
built. When the two disagree, requirements (SRS) win for *what*, this SDS
wins for *how*, and the source code wins over both.

## Reading order

| # | Document | Topic |
|---|----------|-------|
| 00 | [`00-sds-master.md`](./00-sds-master.md) | Single long-form concatenation of every chapter |
| 01 | [`01-introduction.md`](./01-introduction.md) | Purpose, scope, audience, definitions |
| 02 | [`02-design-overview.md`](./02-design-overview.md) | Goals, constraints, principles, trade-offs |
| 03 | [`03-system-architecture.md`](./03-system-architecture.md) | C4 context + container view, runtime topology |
| 04 | [`04-module-decomposition.md`](./04-module-decomposition.md) | Frontend module map |
| 05 | [`05-data-design.md`](./05-data-design.md) | Schema by domain, RLS, indexing, retention |
| 06 | [`06-interface-design.md`](./06-interface-design.md) | API contracts, external adapters, Capacitor bridge |
| 07 | [`07-component-design.md`](./07-component-design.md) | Per-module detailed design |
| 08 | [`08-algorithms-and-logic.md`](./08-algorithms-and-logic.md) | Life Score, Khatam, IF state machine, sync, scoring |
| 09 | [`09-ui-design.md`](./09-ui-design.md) | Design tokens, layout shells, navigation, motion |
| 10 | [`10-state-and-data-flow.md`](./10-state-and-data-flow.md) | State containers, sequence diagrams |
| 11 | [`11-security-design.md`](./11-security-design.md) | RBAC, RLS, guards, audit, threat model |
| 12 | [`12-deployment-design.md`](./12-deployment-design.md) | Web, PWA, Android, iOS, environments |
| 13 | [`13-error-handling-and-observability.md`](./13-error-handling-and-observability.md) | Boundaries, toasts, logs, audit |
| 14 | [`14-performance-design.md`](./14-performance-design.md) | Code splitting, caching, virtualization |
| 15 | [`15-testing-design.md`](./15-testing-design.md) | Vitest setup, smoke tests, QA matrix |
| 16 | [`16-traceability.md`](./16-traceability.md) | SRS ID → SDS section → source files |

## Conventions

- Diagrams are fenced ASCII inside ` ```text ` blocks; no emojis.
- Code paths reference real files; if a path is missing, the design has
  drifted and the codebase is authoritative.
- Memory references (`mem://...`) are not duplicated here to avoid drift.
- Section IDs use `SDS-<chapter>-<n>` (e.g., `SDS-08-3`) and are cited from
  `16-traceability.md`.