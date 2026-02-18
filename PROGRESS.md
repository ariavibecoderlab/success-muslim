# Success Muslim — MVP v3 Implementation Progress

> **Last Updated:** 2026-02-18
> **Strategy:** Build in priority order (P0 → P1 → P2). Update this file after each session.

---

## 🧭 NAVIGATION

| Feature | Status | Notes |
|---------|--------|-------|
| Bottom tab: Home | ✅ | Dashboard route |
| Bottom tab: Iman | ✅ | Deen route |
| Bottom tab: Wellness | ✅ | Health route |
| Bottom tab: Tasks | ✅ | Productivity route |
| Bottom tab: Profile | ❌ | Currently "Family" — needs replacement |

---

## 🏠 HOME MODULE

| Feature | Status | Notes |
|---------|--------|-------|
| Life Score Card (0–100) with sub-scores | ❌ | P0 — depends on Life Score Engine |
| Score recalculates immediately after logging | ❌ | |
| Quick Log buttons (Prayer, Quran, Dhikr, Fast, Water, Weight, Task, Habit) | ❌ | P1 |
| Today Overview: Prayer progress (5/5) | ⚠️ | Shows times but no on-time/late/missed |
| Today Overview: Steps progress | ❌ | Steps not built |
| Today Overview: Water progress | ❌ | Data exists, card missing on Home |
| Today Overview: Tasks completed | ❌ | Data exists, card missing on Home |
| Today Overview: Habits completed | ❌ | Data exists, card missing on Home |
| Today Overview: Sleep target status | ❌ | Sleep targets not built |
| Today Overview: Wake-up target status | ❌ | Wake targets not built |

---

## 🕌 IMAN MODULE

### Prayer Times

| Feature | Status | Notes |
|---------|--------|-------|
| Auto location detection | ⚠️ | Uses geolocation but defaults to KL |
| Manual location override | ❌ | No UI in settings |
| 5 daily prayer times displayed | ✅ | Dashboard widget |
| Calculation method selection | ❌ | |
| Per-prayer notification toggle | ❌ | |
| Optional Adhan sound | ❌ | |
| Countdown to next prayer | ⚠️ | Exists on dashboard |
| Prayer status: On Time / Late / Missed / Unmarked | ❌ | P0 |

### Salah Tracking

| Feature | Status | Notes |
|---------|--------|-------|
| Tap prayer → choose On Time / Late / Missed | ✅ | Popover on each prayer in Dashboard widget |
| Data stored: date, prayer_name, status, logged_timestamp | ✅ | `src/lib/salah-storage.ts` with localStorage |

### Quran Tracker

| Feature | Status | Notes |
|---------|--------|-------|
| Log by minutes OR pages | ❌ | P1 |
| Target setting in profile | ❌ | |
| Quick add buttons (+5 min, +10 min) | ❌ | |

### Dhikr Counter

| Feature | Status | Notes |
|---------|--------|-------|
| Tap counter | ✅ | |
| Preset target | ✅ | |
| Daily reset at midnight | ⚠️ | Resets but verify timing |
| Presets: Subhanallah, Alhamdulillah, Allahu Akbar | ✅ | |

### Fasting Tracker (Iman Mode)

| Feature | Status | Notes |
|---------|--------|-------|
| Toggle "I am fasting today" | ⚠️ | Sunnah fasting calendar exists in Health |
| Fasting types: Sunnah / Qadha / Voluntary | ❌ | |

### Solat Qada Tracker

| Feature | Status | Notes |
|---------|--------|-------|
| Setup wizard (Gender, Age, Baligh) | ✅ | |
| 3 input options | ✅ | |
| Estimation logic (menstruation, consistent periods) | ✅ | |
| Output: Estimated Qada total with breakdown | ✅ | |
| Repayment plan generator (A/B/C) | ✅ | |
| Estimated completion date | ✅ | |
| Daily Qada logging | ✅ | |
| Progress bar | ✅ | |
| Encouraging messages only | ✅ | |

### Ramadhan Uzur Fasting Tracker

| Feature | Status | Notes |
|---------|--------|-------|
| Input: years missed + days | ✅ | |
| Replacement plan generator | ✅ | |
| Estimated completion date | ✅ | |
| Daily Qada fast logging | ✅ | |
| Progress tracker | ✅ | |
| Fidyah Calculator | ✅ | |
| No payment gateway (display only) | ✅ | |

---

## 💪 WELLNESS MODULE

### Step Tracking

| Feature | Status | Notes |
|---------|--------|-------|
| Apple Health / Google Fit sync | ❌ | Web limitation — manual only |
| Manual entry fallback | ❌ | P2 |
| Default goal 10,000 steps (editable) | ❌ | |

### Water Intake

| Feature | Status | Notes |
|---------|--------|-------|
| Default target 2L (editable) | ✅ | |
| Quick add 250ml / 500ml buttons | ⚠️ | Has +250ml, verify +500ml |

### Weight & BMI Tracker

| Feature | Status | Notes |
|---------|--------|-------|
| Input: Weight, Height, Gender, Age | ✅ | |
| BMI auto-calculation | ✅ | |
| BMI category display | ✅ | |

### Calorie Recommendation

| Feature | Status | Notes |
|---------|--------|-------|
| BMR calculation (Mifflin-St Jeor) | ✅ | |
| TDEE = BMR × 1.4 | ✅ | |
| Goal-adjusted calories based on BMI | ⚠️ | TDEE shown, goal-adjust unclear |
| Display "Recommended Max Calories Today" | ⚠️ | Shows TDEE, not labeled as "max" |

### Sleep & Wake Targets

| Feature | Status | Notes |
|---------|--------|-------|
| User sets target sleep time | ❌ | P1 |
| User sets target wake time | ❌ | P1 |
| Sleep reminder notification | ❌ | Web push needed |
| Wake reminder notification | ❌ | Web push needed |
| Islamic motivational message on wake | ❌ | |
| Sleep logging (on time, duration) | ⚠️ | Sleep tracker exists but no target comparison |

---

## 📋 TASKS MODULE

### Daily Tasks

| Feature | Status | Notes |
|---------|--------|-------|
| Add task | ✅ | |
| Mark complete | ✅ | |
| Delete / Edit task | ⚠️ | Delete works, inline edit missing |
| Mark as MIT (max 3) | ✅ | |

### Habit Tracker

| Feature | Status | Notes |
|---------|--------|-------|
| Default habits (Pray on time, Quran, Exercise, Sleep, Wake) | ❌ | No defaults seeded |
| Add custom habit | ✅ | |
| Daily tap to mark done | ✅ | |

---

## 🧠 LIFE SCORE ENGINE

| Feature | Status | Notes |
|---------|--------|-------|
| Weights: Iman 40%, Wellness 30%, Productivity 30% | ❌ | P0 |
| Iman Score: Prayers 60%, Quran 20%, Dhikr 10%, Fasting 10%, Qada bonus | ❌ | P0 |
| Wellness Score: Steps 30%, Water 20%, Weight 10%, Sleep 20%, Wake 20% | ❌ | P0 |
| Productivity Score: Tasks 60%, Habits 40% | ❌ | P0 |

---

## 👤 PROFILE / SETTINGS

| Feature | Status | Notes |
|---------|--------|-------|
| Location setting (for prayer times) | ❌ | P1 |
| Weight / Height / Age / Gender | ⚠️ | In BMI page, not in Settings |
| Quran daily target | ❌ | |
| Step goal | ❌ | |
| Water goal | ⚠️ | In hydration page |
| Sleep target time | ❌ | |
| Wake target time | ❌ | |
| Notification preferences per feature | ❌ | P2 |

---

## 🔐 PRIVACY

| Feature | Status | Notes |
|---------|--------|-------|
| All data is private | ✅ | localStorage + RLS |
| No social leaderboard | ✅ | |
| No community feed | ✅ | |

---

## ❌ OUT OF SCOPE (Confirmed NOT Built)

| Feature | Status |
|---------|--------|
| Family sync | ✅ Not present |
| AI coach | ✅ Not present |
| Community features | ✅ Not present |
| Food calorie logging | ✅ Not present |
| Scholar fatwa engine | ✅ Not present |
| Investment/wealth module | ✅ Not present (placeholder only) |

---

## 🚀 IMPLEMENTATION PRIORITY

### P0 — Core Loop (must work for MVP)
1. Salah Tracking (tap prayer → On Time / Late / Missed)
2. Life Score Engine (weighted calc + display on Home)
3. Home Dashboard overhaul (Life Score card + Today Overview cards)

### P1 — Key Features
4. Quran Tracker (log minutes/pages, target, quick-add)
5. Profile/Settings consolidation (location, goals, targets)
6. Sleep & Wake targets
7. Quick Log buttons on Home
8. Replace Family tab → Profile tab
9. Default habits seeding
10. Task inline edit

### P2 — Polish
11. Manual step tracking
12. Fasting type selection (Sunnah/Qadha/Voluntary)
13. Prayer calculation method selection
14. Goal-adjusted calorie label
15. Notification preferences (web push)
