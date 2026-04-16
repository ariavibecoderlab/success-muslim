

# Cleanup Unused Direct DB Calls + Migrate Remaining Files

## Summary

After the 6-phase migration, **10 files** still call `supabase.from()` directly instead of going through the API layer. Additionally, some files import `supabase` only for `auth` or `storage` but can be cleaned up. No truly dead/unused source files were found — all lib and hook files are actively imported.

## Files Still Using `supabase.from()` (Need Migration)

These files bypassed the migration and still query the database directly:

| File | Tables | Route to |
|------|--------|----------|
| `src/hooks/useQadaQuery.ts` | `qada_solat`, `ramadhan_qada` | `api-misc` (already has qada resources) |
| `src/hooks/useFidyahQuery.ts` | `fidyah_history` | `api-misc` (add fidyah resource) |
| `src/hooks/useWidgetPreferences.ts` | `widget_preferences` | `api-misc` (add widget-prefs resource) |
| `src/components/widgets/SadaqahWidget.tsx` | `sadaqah_donations`, `sadaqah_goals` | `api-wealth` (already has sadaqah) |
| `src/components/widgets/DakwahWidget.tsx` | `dakwah_posters` | `api-misc` (add dakwah resource) |
| `src/pages/deen/DailyDakwah.tsx` | `dakwah_posters` | `api-misc` |
| `src/components/family/FamilyPrivacySettings.tsx` | `family_privacy_settings` | `api-family` (add privacy resource) |
| `src/pages/family/MemberProfile.tsx` | `family_privacy_settings` | `api-family` |
| `src/components/admin/AdminSidebar.tsx` | `profiles` | `api-profile` |
| `src/pages/Blog.tsx` / `src/pages/BlogPost.tsx` | `blog_posts` | `api-misc` (add blog resource, public read) |

## Legitimate `supabase` Uses (Keep As-Is)

- `supabase.auth.*` — AuthContext, Auth.tsx, AuthCallback, ResetPassword, Settings, AdminSidebar signout, db-sync getUserId
- `supabase.storage.*` — Settings avatar upload, BlogEditor images, AdminBlog covers, AdminDawah poster uploads, EditableImage CMS
- `supabase.rpc('has_role')` — useAdmin.ts (security definer function, client-side check is intentional)

## Implementation Steps

1. **Update `api-misc` edge function** — Add resources: `fidyah`, `widget-prefs`, `dakwah`, `blog` (public)
2. **Update `api-family` edge function** — Add resource: `privacy-settings`
3. **Migrate 10 frontend files** — Replace `supabase.from()` with `api()` calls
4. **Remove unused `supabase` imports** — Clean imports in files that no longer need the client after migration
5. **Verify build** — TypeScript compilation check

## What's NOT Being Changed

- All localStorage-based lib files (salah-storage, dhikr-storage, etc.) — still needed for offline-first
- `jakim-proxy` edge function — actively used by prayer-times and hijri
- `db-sync.ts` — already migrated, only uses `supabase.auth.getSession()`
- No files are being deleted — all source files are actively imported

