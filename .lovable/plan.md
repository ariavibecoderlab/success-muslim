

## Fix Three Production Issues Before Launch

### Issue 1: Family Invite Link Shows Wrong Domain

**Problem:** `useFamily.ts` hardcodes `https://success-muslim.lovable.app` when generating invite links. Also, `Install.tsx` references the old domain in install instructions.

**Fix:**
- **`src/hooks/useFamily.ts` (line 115):** Change invite link to use `https://www.successmuslim.app/family/join/${invite_code}`
- **`src/pages/Install.tsx` (lines 94, 125, 156):** Replace all 3 instances of `success-muslim.lovable.app` with `www.successmuslim.app`
- **`index.html` (lines 14, 20):** The OG/Twitter image URLs point to a Lovable CDN -- these can stay as-is (they're image hosting URLs, not page URLs), but we should add `og:url` meta tag pointing to `https://www.successmuslim.app`

### Issue 2: Lovable Login Showing on Production

**What's happening:** The `Auth.tsx` page uses `lovable.auth.signInWithOAuth('google', ...)` from `@lovable.dev/cloud-auth-js`. This is the correct SDK for Google OAuth when using Lovable Cloud -- it is NOT "Lovable branding," it's the auth infrastructure.

**Clarification needed:** The Google OAuth flow goes through Lovable Cloud's auth system, which is expected behavior. The login page itself (`Auth.tsx`) already shows only Success Muslim branding (Moon icon, "Success Muslim" name). If the user is seeing a Lovable-branded consent screen during Google OAuth, that's part of the Lovable Cloud auth flow and cannot be changed from code.

**What we CAN do:** Ensure the Auth page itself has zero Lovable references in visible UI -- which it already does. The page shows the Moon icon and "Welcome Back" text with Success Muslim styling.

### Issue 3: "Edit with Lovable" Badge Visible on Production

**This is a Lovable platform setting, not a code fix.** The badge is injected by the Lovable platform and can be hidden via:

**Settings -> Project Settings -> "Hide 'Lovable' Badge"**

No code change needed -- this is toggled in the Lovable project settings UI.

---

### Summary of Code Changes

| File | Change |
|---|---|
| `src/hooks/useFamily.ts` | Line 115: replace domain with `https://www.successmuslim.app` |
| `src/pages/Install.tsx` | Lines 94, 125, 156: replace 3x `success-muslim.lovable.app` with `www.successmuslim.app` |
| `index.html` | Add `og:url` meta tag with production domain |
| `PROGRESS.md` | Log production fixes |

### Non-Code Actions (User Required)

1. **Hide Lovable Badge:** Go to your Lovable project Settings and toggle "Hide 'Lovable' Badge" ON
2. **Google OAuth branding:** The Lovable Cloud auth consent screen is expected behavior -- the login page UI itself already shows only Success Muslim branding
3. **Existing invite links:** Any families already created in the database still have the old `invite_link` stored. You may want to run a SQL update to fix those, or we can make the share flow use a dynamically generated link instead of the stored one

