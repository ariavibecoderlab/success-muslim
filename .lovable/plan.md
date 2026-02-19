

# Universal Widget System for Dashboard

## Overview
Replace the current hardcoded dashboard layout with a modular, customizable widget system. Users can toggle, reorder, and resize widgets that surface live data from any module (Iman, Health, Wealth, Tasks) directly on the homepage.

## Architecture

### New Database Table
Create a `widget_preferences` table to persist each user's widget layout:
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL)
- `widget_id` (text, NOT NULL) -- e.g. "next_prayer", "hydration", "tasks_today"
- `enabled` (boolean, default true)
- `position` (integer, NOT NULL) -- sort order
- `size` ("small" | "medium" | "large", default "medium")
- `created_at`, `updated_at`
- RLS: users can only CRUD their own rows
- Unique constraint on (user_id, widget_id)

### Widget Registry
A central registry file (`src/lib/widget-registry.ts`) defining all available widgets:

| Widget ID | Module | Component | Smart Behavior |
|-----------|--------|-----------|----------------|
| `next_prayer` | Iman | NextPrayerWidget | Always relevant |
| `dhikr_selawat` | Iman | DhikrSelawatWidget | Always relevant |
| `quran_today` | Iman | QuranTodayWidget | Always relevant |
| `solat_sunat` | Iman | SolatSunatWidget | Always relevant |
| `tarawih` | Iman | TarawihWidget | Ramadan only |
| `if_fasting` | Health | IFFastingWidget | Active fast only |
| `ramadan_fasting` | Health | RamadanFastingWidget | Ramadan only |
| `hydration` | Health | HydrationWidget | Always relevant |
| `sleep` | Health | SleepWidget | Always relevant |
| `sadaqah` | Wealth | SadaqahWidget | Always relevant |
| `tasks_today` | Tasks | TasksTodayWidget | Always relevant |
| `dakwah` | Da'wah | DakwahWidget | Always relevant |

Each entry includes: `id`, `label`, `icon`, `module`, `component`, `defaultEnabled`, `defaultSize`, `smartVisibility` function.

### Component Structure

```
src/
  components/
    widgets/
      WidgetShell.tsx          -- Skeleton loader, error boundary, size wrapper
      NextPrayerWidget.tsx
      DhikrSelawatWidget.tsx
      QuranTodayWidget.tsx
      SolatSunatWidget.tsx
      TarawihWidget.tsx
      IFFastingWidget.tsx
      RamadanFastingWidget.tsx
      HydrationWidget.tsx
      SleepWidget.tsx
      SadaqahWidget.tsx
      TasksTodayWidget.tsx
      DakwahWidget.tsx
  hooks/
    useWidgetPreferences.ts    -- Fetch/save widget layout from DB
  lib/
    widget-registry.ts         -- Central widget definitions
  pages/
    WidgetCustomizer.tsx        -- Full-screen customize overlay
```

### Dashboard Refactor

The current `Dashboard.tsx` (739 lines) will be simplified:
1. Keep: Greeting, Life Score Card, Quick Log buttons, Announcements, Quote
2. Replace: All hardcoded widget cards (prayer strip, quick stats, habits, qada, etc.) with a dynamic widget loop
3. Add: "Customize" button in the top-right area
4. Add: First-time prompt for new widget system

The widget rendering loop:
1. Load user's `widget_preferences` from DB (with defaults for first-time users)
2. Filter by smart visibility (e.g., skip Tarawih outside Ramadan)
3. Render each widget in order using `WidgetShell` wrapper
4. Each widget fetches its own data from existing storage/hooks (single source of truth)

### Widget Customizer
A bottom sheet or full-screen overlay with:
- List of all available widgets grouped by module
- Toggle switch per widget (ON/OFF)
- Drag handle for reorder (using simple touch-move or button-based up/down)
- Size selector (S/M/L) per widget
- "Done" button saves to DB
- Smart widgets show a badge explaining auto-hide behavior

### First-Time Experience
- Check if user has any rows in `widget_preferences`
- If not, show a one-time dialog:
  - "Your dashboard is now customizable! Add widgets from Iman, Health, Wealth and more."
  - [Customize Now] [Maybe Later]
- "Maybe Later" inserts default widget set
- "Customize Now" opens the customizer
- Track dismissal via a `widget_onboarding_seen` flag in `profiles` or localStorage

### Smart Widget Visibility
Each widget can define a `isVisible()` function:
- **Tarawih**: Only show if `useHijriDate().isRamadan` is true
- **IF Fasting**: Only show if there's an active IF session (check `if_sessions` for uncompleted session)
- **Ramadan Fasting**: Only show during Ramadan month
- Widgets hidden by smart rules don't count toward the layout

### Widget Sizes
- **Small**: Single metric + label, rendered as a 1/2-width card
- **Medium**: 2-3 metrics + progress bar, full-width card (default)
- **Large**: Full summary card with detailed breakdown

### Default Widget Set (First-Time Users)
Enabled by default: `next_prayer`, `dhikr_selawat`, `hydration`, `tasks_today`, `quran_today`
Disabled by default: All others (user opts in)

## Technical Details

### Database Migration SQL

```sql
CREATE TABLE public.widget_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  widget_id text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  size text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, widget_id)
);

ALTER TABLE public.widget_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own widgets" ON public.widget_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own widgets" ON public.widget_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own widgets" ON public.widget_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own widgets" ON public.widget_preferences
  FOR DELETE USING (auth.uid() = user_id);
```

### useWidgetPreferences Hook
- Fetches from DB on mount, falls back to defaults
- Provides `toggleWidget`, `reorderWidgets`, `resizeWidget`, `saveAll` methods
- Optimistic updates with background DB sync (same write-through pattern as rest of app)

### WidgetShell Component
- Accepts `size`, `loading`, `error`, `children`
- Shows skeleton while loading
- Shows graceful fallback on error (not a crash)
- Applies size-based CSS classes
- Wraps in motion.div for fade-up animation

### Data Flow
Each widget component imports from existing storage libs (e.g., `getDailyDhikr()`, `getHydration()`, `getTodaySalah()`). No duplicate data sources -- everything reads from the same localStorage + DB sync layer already in place.

## Implementation Sequence

1. Create `widget_preferences` table (migration)
2. Create `src/lib/widget-registry.ts` with all widget definitions
3. Create `src/hooks/useWidgetPreferences.ts`
4. Create `src/components/widgets/WidgetShell.tsx`
5. Create all 12 widget components (can reuse existing dashboard card code)
6. Create `src/pages/WidgetCustomizer.tsx` (bottom sheet)
7. Refactor `src/pages/Dashboard.tsx` to use widget system
8. Add first-time experience dialog
9. Update `PROGRESS.md` and `.lovable/plan.md`

## Files Changed
- **New**: `src/lib/widget-registry.ts`, `src/hooks/useWidgetPreferences.ts`, `src/components/widgets/WidgetShell.tsx`, 12 widget component files, `src/pages/WidgetCustomizer.tsx`
- **Modified**: `src/pages/Dashboard.tsx` (major refactor), `PROGRESS.md`, `.lovable/plan.md`
- **DB**: New `widget_preferences` table with RLS

