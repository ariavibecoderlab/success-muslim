
# Success Muslim - MVP Implementation Plan
**"Your Companion For Success In Both Worlds"**

---

## 1. Landing Page (Full Marketing Style)
A polished, shareable landing page with:
- **Hero Section** — Bold headline "Clear Your Spiritual Debt", tagline, and a "Start Free" CTA button
- **3 Feature Cards** — Qada Solat Tracker, Ramadhan Qada Tracker, Fidyah Calculator with icons and brief descriptions
- **How It Works** — 3-step visual flow: Calculate → Plan → Track
- **Bottom CTA** — Encouragement copy + button to dashboard
- Design: Dark green + white palette, generous whitespace, Apple-level polish

## 2. Dashboard
- **Empty State** — Friendly illustration with 3 cards inviting users to set up each feature
- **Active State** — Shows quick stats for each configured tracker:
  - Qada Solat: Remaining prayers, today's target, streak, progress bar
  - Ramadhan Qada: Days remaining, progress
  - Fidyah: Last calculation summary
- Cards link to their respective detail/tracking pages

## 3. Qada Solat Tracker (Core Feature)
### Setup Wizard (4 Steps)
1. **Personal Info** — Current age, baligh age, gender inputs
2. **Consistency Level** — Slider or selection: "Rarely prayed" / "Sometimes" / "Often" / "Mostly consistent" with percentage mapping
3. **Results** — Calculated breakdown by prayer type (Fajr, Dhuhr, Asr, Maghrib, Isha). For females, auto-deducts menstruation days
4. **Create Plan** — Set daily qada target, see estimated completion date ("At 2 qada/day, done in 2.4 years")

### Daily Tracking Page
- Today's checkboxes grouped by prayer type
- Overall progress bar with percentage
- Stats: Completed / Remaining / Current Streak / Longest Streak
- Encouraging microcopy ("Alhamdulillah! Keep going")

### Calculations
- Total = (current age - baligh age) × 365 × 5 prayers
- Female deduction: ~6 days/month × months × 5 prayers
- Apply consistency % to reduce total
- Streak tracks consecutive days of meeting target

## 4. Ramadhan Qada Fasting Tracker
### Setup
- Input total days owed
- Select reason (menstruation / illness / travel / other)
- Choose strategy: Monday & Thursday / 3 White Days per month / Custom
- See estimated completion timeline

### Tracking Page
- Calendar-style or list view to mark completed days
- Progress bar
- Highlights recommended fasting days (Monday, Thursday, 13th-15th)

## 5. Fidyah Calculator
- Simple single-page form
- Inputs: Days unable to fast, cost per meal, currency
- Instant calculation: Total = days × cost per meal
- Brief educational section: "What is Fidyah?" (2-3 sentences)
- Option to save calculation to history

## 6. Design System
- **Colors**: Dark Green (#1B5E20) primary, Yellow (#FFC107) accent, clean whites and grays
- **Typography**: System fonts, clear hierarchy (Hero 36-48px → Body 16px)
- **Components**: 12px rounded cards with soft shadows, green primary buttons, 8px rounded inputs, smooth animations
- **Spacing**: 8px grid system throughout
- **Light mode only** for MVP

## 7. Data & Storage
- All data stored in browser LocalStorage (no backend needed)
- JSON format with keys: `qada_solat`, `ramadhan_qada`, `fidyah_history`
- Data persists across sessions
- Optimistic UI updates on every interaction

## 8. Mobile-First Responsive Design
- Mobile: Single column, 48px touch targets, full-width cards
- Tablet: 2-column grid layout
- Desktop: Max 3 columns, enhanced hover states
- Smooth transitions between breakpoints

## 9. Navigation Structure
- Landing Page → Dashboard → Feature Pages (max 2 levels deep)
- Simple top navigation with app logo and minimal links
- Back buttons on sub-pages
- No bottom nav needed (few features)

## 10. Quality & Polish
- Accessible: WCAG 2.1 AA, keyboard navigation, ARIA labels, 4.5:1 contrast
- Loading skeletons for perceived performance
- Friendly empty states with CTAs
- Inline form validation with encouraging error messages
- Smooth 60fps animations on progress bars and transitions
- Proper meta tags for sharing
