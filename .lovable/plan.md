

## Fix Verification Redirect, Duplicate Email Alert & Remove Lovable Branding

### Problem
1. Verification email redirects to `lovable.dev` instead of `successmuslim.app` — because `emailRedirectTo` uses `window.location.origin` (which is the preview URL during development)
2. No alert when signing up with an already-registered email
3. Lovable badge visible on published site

### Changes

**1. Hardcode production redirect URL in `src/pages/Auth.tsx`**
- Change `emailRedirectTo` from `${window.location.origin}/auth/callback` to `https://successmuslim.app/auth/callback`
- This ensures verification emails always redirect to the production domain regardless of where signup happens

**2. Detect duplicate email signup in `src/pages/Auth.tsx`**
- After `signUp()`, check `data.user?.identities?.length === 0` — this is how Supabase signals an existing account
- Show a clear toast: "This email is already registered. Please sign in instead."
- Auto-switch to login mode

**3. Hide Lovable badge**
- Use `publish_settings--set_badge_visibility` to hide the "Edit with Lovable" badge on published site

### Files modified
- `src/pages/Auth.tsx` — hardcode redirect URL + duplicate email detection

