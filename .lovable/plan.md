
# Post-Auth Redirect for Invite Links

## Goal
When a logged-out user opens `/family/join/6RBD4U`, they currently get redirected to `/auth` and lose their place. After login + onboarding, they land on `/dashboard`. This plan stores the intended path before any redirect and restores it at the end of the auth/onboarding flow.

## Flow Diagram

```text
User opens /family/join/6RBD4U (not logged in)
        │
        ▼
AuthGuard fires
  → saves /family/join/6RBD4U to localStorage['post_auth_redirect']
  → redirects to /auth
        │
        ▼
User logs in (email/Google)
  Auth.tsx → navigates to /onboarding
        │
        ▼
User completes onboarding
  Onboarding.tsx finishOnboarding()
  → reads localStorage['post_auth_redirect']
  → clears key
  → navigates to /family/join/6RBD4U  ← lands back on invite page!
        │
        ▼
JoinFamily page loads, invite code pre-filled, user taps "Join"
```

## Files to Change

### 1. `src/components/AuthGuard.tsx`
- When `!user` is detected, save `window.location.pathname + window.location.search` to `localStorage.setItem('post_auth_redirect', ...)` **before** returning `<Navigate to="/auth" replace />`.
- Skip saving if the current path is already `/auth`, `/onboarding`, `/`, or `/install` to avoid redirect loops.

```ts
const SKIP_PATHS = ['/', '/auth', '/onboarding', '/install', '/reset-password'];

if (!user) {
  const path = window.location.pathname + window.location.search;
  if (!SKIP_PATHS.some(p => path === p || path.startsWith(p + '/'))) {
    localStorage.setItem('post_auth_redirect', path);
  }
  return <Navigate to="/auth" replace />;
}
```

### 2. `src/pages/Onboarding.tsx` — `finishOnboarding()`
- After marking `onboarding_completed: true`, check `localStorage.getItem('post_auth_redirect')`.
- If a value exists, clear it and navigate there. Otherwise fall back to `/dashboard`.

```ts
const finishOnboarding = async () => {
  if (!user) return;
  setSaving(true);
  await supabase.from('profiles').update({
    onboarding_completed: true,
    onboarding_step: TOTAL_STEPS,
  }).eq('id', user.id);
  setSaving(false);

  const redirect = localStorage.getItem('post_auth_redirect');
  if (redirect) {
    localStorage.removeItem('post_auth_redirect');
    navigate(redirect);
  } else {
    navigate('/dashboard');
  }
};
```

### 3. `src/pages/Auth.tsx` — `handleSubmit` (email login)
- After successful **login** (not signup), also check for `post_auth_redirect` before navigating.
- If a redirect is stored, consume it and navigate there instead of `/onboarding`.
- For new signups: they must verify email first, then complete onboarding — no redirect needed.
- **Note**: Google OAuth returns to `window.location.origin` (no control over where it lands); the `AuthGuard` on the protected route will handle it after the OAuth callback resolves.

```ts
if (isLogin) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // For returning users (onboarding already done), go directly to redirect
  // AuthGuard will handle the onboarding check for new users
  navigate('/onboarding'); // AuthGuard in the target route handles the rest
}
```

Actually, for login — we should still navigate to `/onboarding` which checks `onboarding_completed` and redirects to dashboard if already done. The redirect is consumed at `finishOnboarding` time. If the user has already completed onboarding, the `Onboarding` page redirects straight to `/dashboard` (line 63) — we need to also check for the stored redirect there.

### Revised Onboarding redirect logic (both early-exit AND finish)
There are two places in `Onboarding.tsx` where navigation to `/dashboard` occurs:
1. **Early exit** (line 63): `if (data?.onboarding_completed) navigate('/dashboard', { replace: true })` — user who just logged in is already onboarded.
2. **Finish** (line 238): `navigate('/dashboard')` — user just completed onboarding.

Both need to check for `post_auth_redirect`:

```ts
// Helper inside Onboarding
const navigateAfterOnboarding = () => {
  const redirect = localStorage.getItem('post_auth_redirect');
  if (redirect) {
    localStorage.removeItem('post_auth_redirect');
    navigate(redirect, { replace: true });
  } else {
    navigate('/dashboard', { replace: true });
  }
};
```

Use `navigateAfterOnboarding()` in both the early-exit useEffect and the `finishOnboarding` function.

## Edge Cases Handled

| Scenario | Behaviour |
|---|---|
| User opens invite link, is already logged in + onboarded | AuthGuard passes, lands directly on `/family/join/CODE` — no redirect needed |
| User opens invite link, logged in but needs onboarding | AuthGuard saves path → redirects to `/onboarding` → on finish, navigates to invite URL |
| User opens invite link, not logged in, uses Google OAuth | AuthGuard saves path → Google OAuth returns to origin → `Auth.tsx` redirects to `/onboarding` → finish navigates to stored redirect |
| User opens invite link, not logged in, uses email | AuthGuard saves path → login → onboarding check → finish navigates to stored redirect |
| User navigates to a regular protected page while logged out | AuthGuard saves `/dashboard` or `/iman/quran` etc. → after auth → redirect back |
| Skip paths (/, /auth, /onboarding) | Not stored — prevents redirect loops |
| Path already has invite code in URL | Full `pathname + search` is stored, so code survives |

## Build Sequence

1. `src/components/AuthGuard.tsx` — add localStorage write before unauthenticated redirect
2. `src/pages/Onboarding.tsx` — add `navigateAfterOnboarding` helper, use it in both early-exit and finish
3. `src/pages/Auth.tsx` — no changes required (login already navigates to `/onboarding` which handles the redirect)

No database changes required. No new dependencies.
