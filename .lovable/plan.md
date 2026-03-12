

## Auto-detect Calculation Method by Country

Add a country-to-method mapping so Indonesian users get KEMENAG (method 20), Malaysian users get JAKIM, and everyone else gets Umm al-Qura (method 4).

### Changes

**`src/lib/prayer-times.ts`**

1. Add a country-method mapping constant:
```typescript
const COUNTRY_METHOD_MAP: Record<string, number> = {
  'indonesia': 20,  // KEMENAG
  'malaysia': 17,   // JAKIM (handled separately but for reference)
};
const DEFAULT_INTL_METHOD = 4; // Umm al-Qura
```

2. In `fetchFromAladhan()`, replace hardcoded `method=4` with a lookup: resolve `settings.calculation_method` if explicitly set by user, otherwise use the country map or fall back to Umm al-Qura.

3. Update `DEFAULT_SETTINGS.calculation_method` logic — keep 3 (MWL) as stored default, but the runtime fetch will auto-select based on country when no explicit override exists.

### Files Modified
- `src/lib/prayer-times.ts`

