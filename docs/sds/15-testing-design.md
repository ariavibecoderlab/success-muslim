# 15 · Testing Design

## 15.1 Test layers

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | `src/lib/*` (zakat, life-score, quran-mapping, calculations, hijri). |
| Component | Vitest + Testing Library | Pure presentational components; hook contracts. |
| Integration | Vitest | Hooks against a mocked Supabase client; sync queue behavior. |
| Manual smoke | Checklist | 25-point matrix mirroring SRS §10. |
| Store-listing QA | Manual | Pre-submission checklist under `docs/store-listings/`. |

End-to-end browser automation is **out of scope for MVP** (high cost vs.
benefit on a single-developer cadence). Capacitor builds are smoke-tested
manually on a reference device per release.

## 15.2 Setup

- Config: `vitest.config.ts`.
- Setup file: `src/test/setup.ts` (jest-dom, MSW or supabase mocks).
- Example: `src/test/example.test.ts`.
- Run locally: `bunx vitest run`.
- Coverage target (informational, not gated): 60 % for `lib/`; lower for
  pages.

## 15.3 What to test

| Must test | Why |
|-----------|-----|
| `lib/zakat.ts` calculations | Religious correctness. |
| `lib/life-score.ts` weighting | Drives the headline UX number. |
| `lib/quran-mapping.ts` | Wrong mapping is silently wrong. |
| `lib/calculations.ts` (BMI, percentages) | Health-relevant numbers. |
| Backdate guard logic | Security boundary. |
| `db-sync` enqueue + flush | Offline contract. |
| Hooks: read-through cache (priming from localStorage) | Zero-flash guarantee. |
| Family leaderboard score (mirrored client check) | Privacy gates respected. |

## 15.4 What not to test (yet)

- Pixel-level UI snapshots (high churn).
- Native plugin code paths (run on device).
- Edge function bodies via HTTP (run with `supabase--test_edge_functions`
  ad hoc).

## 15.5 Smoke matrix (MVP)

Mirrors SRS §10. Each item must pass on the reference Android device, a
stock iOS device, and Chrome desktop before release:

1. Sign up with email + verify.
2. Sign in with Google.
3. Complete onboarding (7 steps).
4. Dashboard renders with widgets and life score.
5. Prayer times load (Malaysian zone → JAKIM; other → Aladhan).
6. Log a salah and see streak update.
7. Open Quran Reader; read; verify session persists across reload.
8. Open Quran Stats; verify Khatam % + ETA.
9. Use dhikr counter with haptics.
10. Log a sunnah fast.
11. Add a sadaqah entry; see goal progress.
12. Run zakat calculator; save snapshot.
13. Set up Qada; decrement via tracker.
14. Start IF session; close app; verify timer survives.
15. Log weight + hydration + sleep.
16. Add a transaction; verify wealth summary.
17. Create a habit; check streak.
18. Create a family; invite by code; member joins.
19. View family leaderboard with privacy gates.
20. Daily check-in; verify streak award.
21. Read a blog post.
22. Toggle CMS overlay as admin; edit text; verify override.
23. Open admin console on desktop; view live feed.
24. Go offline; log salah; come back online; verify sync.
25. Sign out; sign back in with deep-link `post_auth_redirect`.

## 15.6 Release sign-off

- Smoke matrix passes.
- `bunx vitest run` green.
- `docs/store-listings/pre-submission-checklist.md` complete.
- Admin live feed shows no error spikes for 24 h on Live backend.