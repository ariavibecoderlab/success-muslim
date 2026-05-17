# 08 · Algorithms & Logic

This chapter documents the non-trivial computations. Where a memory note
owns the canonical formula, this chapter cites it instead of duplicating
(to avoid drift).

## 8.1 Life Score

Composite score 0–100 computed daily in `src/lib/life-score.ts` from
three sub-scores. Canonical weights live in `mem://features/life-score-logic`.

```text
iman        = w_salah*salah + w_quran*quran + w_dhikr*dhikr
              + w_sunnah*sunnah + w_fasting*fasting          (0..100)
wellness    = w_hydra*hydra + w_sleep*sleep + w_weight*wtrend
              + w_if*ifAdh                                   (0..100)
productivity= w_tasks*tasksDone + w_habits*habitStreaks      (0..100)

lifeScore   = round( wI*iman + wW*wellness + wP*productivity )
```

Each sub-input is clamped 0..1 before multiplication. The composite is
stored client-side only (no table) and recomputed on every dashboard mount.

## 8.2 Khatam math

```text
totalAyahs = 6236
totalPages = 604
khatamPct  = readAyahs / totalAyahs * 100
pace7d     = sum(ayahsReadLast7Days) / 7
etaDays    = pace7d > 0 ? ceil((totalAyahs − readAyahs) / pace7d) : ∞
```

Static mapping tables `surahByAyah`, `juzByAyah`, `pageByAyah` in
`src/lib/quran-mapping.ts` give O(log n) lookups for any reading position.

## 8.3 Prayer-time method selection

```text
if prayer_settings.calc_method.startsWith('JAKIM_')
   and zone ∈ jakim_zones:
    times = jakim-proxy(zone, date)
else:
    times = aladhan(lat, lng, method, date)
cacheKey = `prayer:${date}:${zoneOrLatLng}`
```

Notification offsets: configurable per prayer (e.g., 0 min, 5 min before).
Adhan files: bundled mp3; native uses local notification with custom
sound; web uses HTML5 Audio fallback.

## 8.4 IF timer state machine

```text
 states: idle → scheduled → running → completed
                       ▲          │
                       └─ cancelled ┘

 start():   idle/scheduled → running    persists to sm:fasting:active
 tick():    running                    elapsed = now() − started_at
 end():     running → completed         posts to api-health (if-end)
 cancel():  scheduled/running → idle    clears localStorage
```

Elapsed time is **always** derived from `started_at`, never decremented
from a stored counter, so the timer survives reloads and offline periods
(`mem://features/health-hub`).

## 8.5 Streak rules

| Streak | Source | Reset rule |
|--------|--------|------------|
| Daily check-in | `daily_checkins.streak_day` | Reset if a date is skipped without a backdate within 24 h. |
| Quran daily target | `quran_daily_log.target_met` | Continuous if `target_met=true` for each day. |
| Habit | derived from `habit_log` | Reset on first missed day. |

Backdate window (90 days) preserves streaks if filled in time.

## 8.6 Leaderboard scoring (family)

Per `get_family_leaderboard` SQL:

```text
score = min(100,
    min(50, prayers_this_week * 10) +
    min(30, quran_target_days_this_week * 5) +
    min(20, fasting_days_this_week * 3)
)
```

Privacy gates: `family_privacy_settings.show_on_leaderboard` and
`ghost_mode` are returned so the UI can hide members or anonymize them.

## 8.7 Backdate validation

```text
isAllowedBackdate(d) := today − d ≤ 90 days AND d ≤ today
```

Applied in: `BackdateDatePicker` (UI), edge functions (server), never RLS.

## 8.8 Offline sync queue

```text
enqueue(op):
    list = JSON.parse(localStorage[`sm:${domain}:pending`] || '[]')
    list.push({ op, payload, uuid: uuidv4(), ts: now() })
    localStorage[...] = JSON.stringify(list)

flush():
    for each domain:
        list = read()
        for op in list (FIFO):
            try:
                api-client.post(op)
                remove op from list
            catch ApiOfflineError:
                stop and try again later
            catch ApiError(VALIDATION | CONFLICT):
                drop op + log to console + toast
        write(list)

triggers: window 'online', document 'visibilitychange' (visible),
          AuthContext session restore, manual pull-to-refresh.
```

Idempotency: every op carries a client UUID; server upserts on
`(user_id, client_uuid)` (or natural key) so retries are safe.

## 8.9 Conflict resolution

Last-write-wins by `updated_at` from the server. Two special cases:

1. **Active IF session:** client wins until session ends.
2. **Quran in-progress session:** client wins until flushed; thereafter
   server is authoritative.

## 8.10 Zakat calculation

`src/lib/zakat.ts` accepts cash, gold (g), silver (g), business assets,
investments. Nisab computed from current gold/silver per-gram input.
Zakat due = 2.5% of zakatable wealth above nisab. History stored in
`zakat_history` with snapshot of inputs.

## 8.11 BMI & health derivations

`src/lib/calculations.ts` computes:

- `bmi = weight_kg / (height_m ^ 2)`
- BMI bucket: Underweight <18.5, Normal <25, Overweight <30, Obese ≥30.
- Daily hydration goal: profile-driven (default 2000 ml).
- Sleep duration: derived from `start`/`end` rounded to nearest 15 min.

## 8.12 Greeting / context

`useContextualGreeting` blends time-of-day + next prayer + Hijri date to
produce the dashboard greeting line.