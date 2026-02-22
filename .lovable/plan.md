

## Enhanced Settings Page

The current Settings page is functional but basic. This plan polishes it into a premium, well-organized settings hub that surfaces all user-configurable options in one place.

### Current State
- Avatar + name header
- Account info card (email, auth provider)
- Edit Profile card (name, city, country)
- Family Privacy settings
- Sign Out button

### What Changes

#### 1. Add Prayer Location Quick-Link
A new card showing current prayer location (city/country from prayer_settings) with a "Change" button that links to `/iman/prayer-times` settings. This gives users quick access to their most-used setting without duplicating the full prayer settings UI.

#### 2. Add "Data & Storage" Section
A card with:
- "Clear local cache" button (clears localStorage, shows toast)
- App version display (hardcoded or from package.json)

#### 3. Add "Change Password" Section
For email-authenticated users, add an inline card that sends a password reset email (reusing the existing `resetPasswordForEmail` logic). Shows "Reset link sent!" confirmation.

#### 4. Visual Polish
- Larger avatar (h-28 w-28) with a subtle gradient ring
- Section headers use consistent icon + title pattern
- Smooth fade-in animation using framer-motion
- Better spacing and visual hierarchy
- "Danger Zone" styling for sign out area
- Gender field added to Edit Profile (select: male/female) since it exists in the profiles table but isn't editable

#### 5. Reorder Sections for Better Flow
1. Avatar + Name header
2. Edit Profile (name, gender, city, country)
3. Account Info (email, provider, change password)
4. Prayer Location quick-link
5. Family Privacy
6. Data & Storage
7. Sign Out (danger zone styling)

### Technical Details

**Files modified:**
- `src/pages/Settings.tsx` -- Complete enhancement with new sections, polish, and animations

**New imports needed:**
- `framer-motion` for fade-in animations
- `usePrayerSettings` for prayer location display
- `Select` component for gender dropdown
- `Lock`, `Trash2`, `Clock`, `ChevronRight` from lucide-react

**Gender field:**
- Read `gender` from profiles table on load (already exists in DB schema)
- Add a Select dropdown with "Male" / "Female" options
- Save alongside other profile fields

**Change Password:**
- Only shown when `user.app_metadata.provider === 'email'`
- Calls `supabase.auth.resetPasswordForEmail(user.email)`
- Shows "Reset link sent to your email" toast

**Prayer Location:**
- Uses `usePrayerSettings()` hook to get current city/country
- Displays as a clickable card linking to `/iman/prayer-times`

**Clear Cache:**
- `localStorage.clear()` then `toast({ title: 'Cache cleared' })`
- Note: user will need to refresh for changes to take effect

**Animations:**
- Wrap main content in `motion.div` with `initial={{ opacity: 0, y: 12 }}` and `animate={{ opacity: 1, y: 0 }}`
- Stagger children for a polished sequential reveal

