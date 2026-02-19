

# Universal Widget System for Dashboard — IMPLEMENTED ✅

## Overview
The dashboard now uses a modular, customizable widget system. Users can toggle, reorder, and resize 12 widgets from any module (Iman, Health, Wealth, Tasks, Da'wah).

## What Was Built

### Database
- `widget_preferences` table with RLS (user_id, widget_id, enabled, position, size)
- Auto-updating `updated_at` trigger

### Files Created
- `src/lib/widget-registry.ts` — Central registry of 12 widgets with lazy loading
- `src/hooks/useWidgetPreferences.ts` — DB persistence hook with optimistic local updates
- `src/components/widgets/WidgetShell.tsx` — Skeleton loader + error boundary wrapper
- `src/components/widgets/WidgetCustomizer.tsx` — Bottom sheet for toggle/reorder/resize
- 12 widget components in `src/components/widgets/`

### Files Modified
- `src/pages/Dashboard.tsx` — Refactored from 739 lines of hardcoded cards to dynamic widget loop
- `PROGRESS.md` — Updated with widget system entries

### Widget List
| ID | Module | Smart Behavior |
|----|--------|----------------|
| next_prayer | Iman | Always |
| dhikr_selawat | Iman | Always |
| quran_today | Iman | Always |
| solat_sunat | Iman | Always |
| tarawih | Iman | Ramadan only |
| if_fasting | Health | Active fast only |
| ramadan_fasting | Health | Ramadan only |
| hydration | Health | Always |
| sleep | Health | Always |
| sadaqah | Wealth | Always |
| tasks_today | Tasks | Always |
| dakwah | Da'wah | Always |

### Default Enabled: next_prayer, dhikr_selawat, quran_today, hydration, tasks_today
