

## Redesign Quick Log → Horizontal Scrollable Feature Bar

### What changes

**1. `src/components/dashboard/QuickLogGrid.tsx` → full rewrite**

Remove the 4×2 card grid. Replace with a single horizontal scrollable row of compact icon pills (no card wrappers). Each item is just a gradient circle + label, no `Card`/`CardContent`. Add an "Edit" button at the end of the row that opens a sheet to show/hide items.

Layout: `flex overflow-x-auto gap-3 scrollbar-hide` with `snap-x` for smooth scroll. Each item is ~56px wide (circle + label stacked). Items come from a new `useQuickLogPreferences` hook that tracks which shortcuts are visible.

**2. New hook: `src/hooks/useQuickLogPreferences.ts`**

Stores which quick log items are enabled and their order. Uses localStorage with the key `quick_log_prefs`. Falls back to showing all 8 by default.

Interface:
```ts
{ enabledIds: string[], toggleItem: (id: string) => void, reorder: (ids: string[]) => void }
```

**3. Quick Log Edit Sheet**

A small drawer/sheet triggered by a pencil/edit icon at the end of the scroll row or via the section header. Lists all available quick log items with toggle switches — same pattern as the existing `WidgetCustomizer` but simpler (no resize/reorder, just on/off toggles).

### Visual spec

- No card wrapper per icon — just bare gradient circle (w-10 h-10) + label below (text-[10px])
- Single row, horizontally scrollable, no wrapping
- `scrollbar-hide` utility (already in Tailwind config or add via CSS)
- Slight horizontal fade on edges (optional, via gradient mask)
- Edit button: small `Settings2` icon pill at the row end

### Files to create/modify
1. **`src/hooks/useQuickLogPreferences.ts`** — new, localStorage-backed preference hook
2. **`src/components/dashboard/QuickLogGrid.tsx`** — rewrite to horizontal scroll + edit sheet
3. **`src/index.css`** — add `.scrollbar-hide` utility if not present

