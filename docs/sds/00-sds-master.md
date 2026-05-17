# Software Design Specification — Master Document

**Project:** Success Muslim · **App ID:** `com.brainybunch.successmuslim`
**Standard:** IEEE 1016-2009 (adapted) · **Companion:** [SRS](../srs/README.md)

This master document is the canonical entry point. To keep a single source
of truth (and avoid drift between a long-form copy and the split chapters),
each section below is **published as a standalone file** and linked here in
reading order. Open the linked file for the full content.

| § | Chapter |
|---|---------|
| 01 | [Introduction](./01-introduction.md) |
| 02 | [Design Overview](./02-design-overview.md) |
| 03 | [System Architecture](./03-system-architecture.md) |
| 04 | [Module Decomposition](./04-module-decomposition.md) |
| 05 | [Data Design](./05-data-design.md) |
| 06 | [Interface Design](./06-interface-design.md) |
| 07 | [Component Design](./07-component-design.md) |
| 08 | [Algorithms & Logic](./08-algorithms-and-logic.md) |
| 09 | [UI Design](./09-ui-design.md) |
| 10 | [State & Data Flow](./10-state-and-data-flow.md) |
| 11 | [Security Design](./11-security-design.md) |
| 12 | [Deployment Design](./12-deployment-design.md) |
| 13 | [Error Handling & Observability](./13-error-handling-and-observability.md) |
| 14 | [Performance Design](./14-performance-design.md) |
| 15 | [Testing Design](./15-testing-design.md) |
| 16 | [Traceability](./16-traceability.md) |

## Authority order

1. **Source code** wins over both SRS and SDS.
2. **SRS** wins for *what* the system must do.
3. **SDS** wins for *how* it is built.

## Change control

Any change to design that affects behavior must update the matching SRS
section. Pure refactors update SDS only. Schema changes additionally
update `src/integrations/supabase/types.ts` automatically via Lovable
Cloud migration tooling.