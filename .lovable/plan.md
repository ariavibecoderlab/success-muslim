

## Fix: Show Correct User Name in Rotating Header

### Problem
The `profiles.display_name` for the logged-in user is `"nashihamm"` (email username), not the actual name `"Nashih Amm"` from the auth account. So the header shows "salaam, nashihamm" instead of "salaam, Nashih".

### Solution
Update the `useDisplayName` hook in `src/hooks/useDashboardData.ts` to fall back to the auth user's metadata name when the profile `display_name` looks like an email/username.

Specifically, change the query function to:
1. First try `profiles.display_name`
2. If empty or missing, fall back to `user.user_metadata.full_name` or `user.user_metadata.name`
3. Final fallback: extract a readable name from the email

### Changes

**`src/hooks/useDashboardData.ts`** — `useDisplayName` function (~line 37-44):
- After fetching `display_name` from profiles, if the result equals the email username (no spaces, looks like a handle), prefer `user.user_metadata.full_name` or `user.user_metadata.name` instead.

Alternatively, the simplest fix: **update the `display_name` in the database** to "Nashih Amm" and also ensure the profile trigger copies the full name from auth metadata on signup.

### Recommended Approach
1. Update the existing profile record's `display_name` to the auth metadata name
2. Fix the profile creation trigger to use `raw_user_meta_data->>'full_name'` so future signups get the correct name

