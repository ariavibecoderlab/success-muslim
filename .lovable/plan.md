

## Fix Health Page Icons to Match Feature Names

A quick icon update to ensure each feature card and quick action uses an icon that accurately represents its function.

### Current Issues

| Feature | Current Icon | Problem |
|---------|-------------|---------|
| Weight Tracker | `TrendingUp` (chart line) | Doesn't convey "weight" -- looks like a stock chart |
| Sunnah Fasting | `Moon` (crescent) | Moon = night/sleep, not fasting |

### Proposed Fix

| Feature | New Icon | Why |
|---------|----------|-----|
| Weight Tracker | `Weight` | Directly represents body weight |
| Sunnah Fasting | `UtensilsCrossed` | Universal symbol for food/fasting (utensils crossed out = not eating) |

### File Changed

**`src/pages/Health.tsx`**
- Line 3: Update imports -- replace `TrendingUp` with `Weight`, keep `UtensilsCrossed` (already imported)
- Line 81: Weight Tracker feature card -- change `TrendingUp` to `Weight`
- Line 85: Sunnah Fasting feature card -- change `Moon` to `UtensilsCrossed`
- Line 93: Quick action "Meal" -- keep `UtensilsCrossed` as-is (still appropriate for meal logging)

Note: `Moon` import can be removed if not used elsewhere in this file.

