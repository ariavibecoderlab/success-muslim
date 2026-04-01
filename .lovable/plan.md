

## Fix Email Verification Flow

### Changes

**1. Configure Cloud auth settings**
- Use `cloud--configure_auth` to ensure email confirmations are enabled
- Add redirect URLs: `https://id-preview--b9a116fe-f80b-4255-b061-8b5d84d41884.lovable.app/auth/callback` and `https://success-muslim.lovable.app/auth/callback`

**2. Create `src/pages/AuthCallback.tsx`**
- New page that handles the verification token exchange
- Calls `supabase.auth.getSession()` (Supabase JS auto-detects hash params)
- On success: check `localStorage` for `post_auth_redirect`, then redirect to that or `/dashboard`
- On failure: redirect to `/auth` with error toast

**3. Update `src/pages/Auth.tsx`**
- Change `emailRedirectTo` from `window.location.origin` to `` `${window.location.origin}/auth/callback` ``
- Improve signup toast: mention checking spam/junk folder

**4. Update `src/App.tsx`**
- Add route: `<Route path="/auth/callback" element={<AuthCallback />} />`

**5. Update `src/components/AuthGuard.tsx`**
- Add `/auth/callback` to `SKIP_PATHS`

### Files
- `src/pages/AuthCallback.tsx` — new
- `src/pages/Auth.tsx` — update redirect URL + toast message
- `src/App.tsx` — add callback route
- `src/components/AuthGuard.tsx` — add skip path

