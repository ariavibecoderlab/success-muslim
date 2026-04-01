## Hide sementara Google OAuth untuk dipakai kemudian hari lagi & Keep Email-Only Auth

### Overview

Remove the Google OAuth button and divider from the Auth page, keeping only email/password sign-in and sign-up. Email verification is already handled by default (no auto-confirm) — users get a verification email and must confirm before signing in.

### Changes

`**src/pages/Auth.tsx**`:

1. Remove the `lovable` import (line 4)
2. Remove `googleLoading` state (line 20)
3. Remove `handleGoogleSignIn` function (lines 35-46)
4. Remove the Google Sign-In button JSX (lines 103-121)
5. Remove the "or" divider (lines 123-128)

### Also fix pre-existing build errors

`**supabase/functions/jakim-proxy/index.ts**` (line 76):

- Cast `error` to `Error` type: `(error as Error).message`

`**src/utils/native/device.ts**`:

- Add missing `operatingSystem` and `webViewVersion` to the fallback object
- Fix `appVersion`/`appBuild` references on `DeviceInfo`

`**src/utils/native/notifications.ts**`:

- Remove `priority` from notification schemas
- Fix `getDelivered`/`removeDelivered` → correct Capacitor API names
- Fix argument count and missing `notificationId` property

### No database or auth config changes needed

Email verification is already the default behavior — users must verify their email before signing in. The signup flow already shows "Please check your email to verify your account before signing in."