use this  
You are a **Senior Frontend Developer + Mid-level UI/UX Designer** tasked to audit "Success Muslim App" — a super-app for Muslims combining spirituality, health, finance, productivity, and family management.

This app is in early development. Your job is to:

1. Map out **what exists** vs **what's missing**
2. Rate the **quality of what's already built**
3. Give **priority recommendations** for what to build next

---

## AUDIT INSTRUCTIONS

Do a thorough audit of the entire codebase. Check every file, component, page, and logic. Then generate an audit report in the format below.

---

## AUDIT OUTPUT FORMAT

### PART 1: EXECUTIVE SUMMARY

- Estimated % of MVP done (rough is fine)
- 3 biggest strengths already in the app
- 3 critical gaps holding the app back
- 1-sentence recommendation for next direction

---

### PART 2: AUDIT BY PILLAR

For each pillar below, use this format:

```
#### [PILLAR NAME]
Overall Status: ⬜ Not built | 🟨 Partial | 🟩 Implemented

| Feature | Status | Quality | Notes |
|---------|--------|---------|-------|
| Feature name | ⬜/🟨/🟩 | ⭐⭐⭐ | What's missing / what's good |
```

**Quality:**

- ⭐ = Exists but broken/placeholder
- ⭐⭐ = Works but very basic
- ⭐⭐⭐ = Solid, production-ready

---

#### PILLAR 1: DEEN (Spiritual Optimization)

Check if these features exist:

**Core:**

- Prayer times — real-time, GPS-based?
- Smart Adhan — audio, notification scheduling?
- Quran reader — Arabic text, translation, surah/ayat navigation?
- Quran Tafsir — available?
- Quran Memorization tracker — progress tracking?
- Tajweed AI correction — voice input / feedback?
- Dhikr counter — tap counter, preset dhikr, streaks?
- Sunnah tracker — daily checklist?
- Sadaqah tracker — donation log?
- Zakat calculator — Nisab, gold, silver, savings?
- Islamic calendar — Hijri date showing?

**Advanced:**

- Qiyam planner — tahajjud wake-up alarm?
- Ramadan optimizer mode — special Ramadan mode?
- Hajj/Umrah planner — checklist + countdown?
- Deen Score dashboard — gamified scoring system?

---

#### PILLAR 2: HEALTH & FITNESS

Check if these features exist:

**Core:**

- Walking tracker — step counter, 10k challenge?
- Activity tracker — running, cycling, swimming, manual input?
- Intermittent fasting tracker (16:8, 24h, 48h, 72h)?
- Sunnah fasting — Monday/Thursday reminder, Ayyamul Bidh?
- Weight & body metrics — input weight, height, BMI calculation?
- Sleep tracker — sleep time input/output?
- Hydration/Water intake tracker — daily log, target?
- Protein intake tracker — food/protein log?
- BMI assessment — visual and interpretive?
- Medical checkup uploader — upload lab results, track progress?

**Advanced:**

- Health Score — aggregate health score calculation?
- Warrior Mode fasting challenge?
- Ramadan performance mode?
- Tahajjud smart wake — alarm based on sleep + Qiyam?

---

#### PILLAR 3: WEALTH & FINANCIAL PLANNING

Check if these features exist:

**Core:**

- Personal budget tracker — income, expenses, balance?
- Family budget dashboard — multi-user view?
- Expense categorization — halal categories?
- Zakat auto-calculation — integrated with wealth data?
- Sadaqah goal setting — monthly/yearly donation target?
- Islamic investment tracker — Shariah screening?
- Debt-free planner — debt tracking, payoff projection?
- Waqf planner — setting aside assets for waqf?
- Education savings planner — for kids?

**Advanced:**

- Halal income score?
- Wealth growth projection — charts/graphs?
- Family wealth vision board?

---

#### PILLAR 4: PRODUCTIVITY & GOAL MANAGEMENT

Check if these features exist:

**Core:**

- Daily task manager — daily to-do list?
- Weekly life dashboard — summary of all life areas?
- Habit streak tracker — habit gamification?
- Islamic habit goals — on-time Salah, daily tilawah?
- Family shared goals — collaborative family targets?
- Kids chore system — reward system for kids?
- Long-term goals (5-10 year plan)?
- Vision board — visual goals?
- Life areas tracking (Iman, Health, Wealth, Family, Knowledge, Business)?

**Advanced:**

- AI Life Coach (Islamic aligned) — chatbot or recommendations?
- Life Score dashboard — aggregate score across all pillars?
- Focus mode — block distractions during prayer times?

---

#### PILLAR 5: FAMILY MANAGEMENT MODE

Check if these features exist:

**Core:**

- Husband & wife financial sync — shared finance view?
- Shared calendar — family events together?
- Kids Islamic education tracker — Quran/memorization progress?
- Family halaqah tracker — family study session log?
- Family goals — shared family OKR?
- Ramadan family planner?
- Household task delegation — chore assignment?
- Family meeting template?

**Savings Funds:**

- Holiday savings fund?
- Umrah savings fund?
- Haji savings fund?
- Waqaf savings fund?
- Sadaqah savings fund?

---

### PART 3: UI/UX & TECHNICAL AUDIT

#### 3A. Navigation & Information Architecture

- Is navigation between pillars clear and intuitive?
- Is there a bottom nav / sidebar reflecting the 5 pillars?
- Is there an onboarding flow (profile, goals, location, mazhab)?
- Is there a home dashboard summarizing all pillars?

#### 3B. Design System

- Is there a consistent design system (colors, typography, spacing)?
- Is Islamic aesthetic applied (geometry, appropriate palette)?
- Dark mode available?
- Mobile responsive?
- Loading states, empty states, error states?

#### 3C. Data & State Management

- User authentication (login/register)?
- Data persistence (localStorage, Supabase, or other DB)?
- Multi-user / family account support?
- API integrations (prayer times API, Quran API)?

#### 3D. Gamification & Engagement

- Streak system?
- Notifications/reminders?
- Progress visualization (charts, rings, bars)?
- Achievement / badge system?

---

### PART 4: PRIORITIZED ROADMAP

After the audit, give recommendations in this format:

#### 🔴 SPRINT 1 — Critical Foundation (Week 1-2)

> Features that MUST exist for the app to have basic value proposition

- [list recommended features]

#### 🟠 SPRINT 2 — Core Value (Week 3-4)

> Features that start making the app feel different from competitors

- [list features]

#### 🟡 SPRINT 3 — Differentiation (Month 2)

> Unique features that become the app's competitive moat

- [list features]

#### 🟢 SPRINT 4+ — Scale & Polish (Month 3+)

> Advanced + AI features

- [list features]

---

### PART 5: QUICK WINS (48-Hour Recommendations)

Identify **3-5 improvements doable in 48 hours** with the biggest impact on:

- User first impression
- Basic functionality
- Visual credibility

---

### PART 6: RED FLAGS & TECHNICAL DEBT

Flag things that if left alone will become big problems:

- Anti-patterns in code
- Missing error handling
- Scalability concerns
- Security concerns (especially around financial and family data)

---

## FINAL CHECKLIST FOR AUDITOR

Before submitting the audit report, make sure you've:

- Opened and read every main component file
- Checked routing and page structure
- Looked at state management (Redux / Zustand / Context)
- Checked API calls and data fetching
- Looked at package.json for existing dependencies
- Done a mental simulation: "If I'm a new user, what can I actually do?"

---

## IMPORTANT NOTES FOR AUDITOR

1. **Don't assume** a feature exists just because there's a file/folder — check if it actually works
2. **Check** if Islamic features are fiqh-correct (e.g. Zakat calculation, fasting rules)
3. **Flag** misleading features (UI exists but logic doesn't)
4. **Evaluate** from the perspective of a practical Muslim user, not just a developer
5. **Prioritize** suggestions based on user impact, not ease of implementation