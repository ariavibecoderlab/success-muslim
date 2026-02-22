

## Fix: Onboarding Shows Again for Registered Users

### Root Cause

**Auth.tsx line 33** always redirects logged-in users to `/onboarding`:
```
if (user) return <Navigate to="/onboarding" replace />;
```

This means every time a returning user's session is restored (app reopen, page refresh), if they briefly hit `/auth` or if Auth.tsx renders while the session loads, they get sent to `/onboarding`. The Onboarding page then checks the DB and redirects to dashboard -- but the user sees a flash of onboarding UI, and on slow connections it may fully render.

**Auth.tsx line 56** also hardcodes `navigate('/onboarding')` after login, even for returning users.

### Fix

#### 1. `src/pages/Auth.tsx`

- Change line 33: Instead of blindly redirecting to `/onboarding`, redirect to `/dashboard`
- The AuthGuard already handles the onboarding check -- if the user hasn't completed onboarding, AuthGuard will redirect them
- Change line 56: After login, navigate to `/dashboard` instead of `/onboarding`
- This way, returning users go straight to dashboard, and new users get caught by AuthGuard's onboarding check

#### 2. `src/hooks/useAuth.ts`

- Fix the race condition where `onAuthStateChange` can fire before `getSession` completes, causing a brief flash of unauthenticated state
- Use the pattern from the stack overflow suggestion: only set `loading = false` once, after the initial session check
- Prevent `onAuthStateChange` from setting loading to false prematurely during the `INITIAL_SESSION` event

### Technical Details

**Auth.tsx changes:**
```typescript
// Line 33: Change from
if (user) return <Navigate to="/onboarding" replace />;
// To
if (user) return <Navigate to="/dashboard" replace />;

// Line 56: Change from
navigate('/onboarding');
// To
navigate('/dashboard');
```

**useAuth.ts changes:**
```typescript
useEffect(() => {
  let initialLoad = true;

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Only set loading false from onAuthStateChange 
      // AFTER the initial getSession has completed
      if (!initialLoad) setLoading(false);
    }
  );

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
    initialLoad = false;
  });

  return () => subscription.unsubscribe();
}, []);
```

This ensures:
- Returning users with completed onboarding go directly to dashboard (no onboarding flash)
- New users who haven't completed onboarding are caught by AuthGuard and redirected to `/onboarding`
- No race condition where loading briefly shows false before session is confirmed
