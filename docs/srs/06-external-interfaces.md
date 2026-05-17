# 06 · External Interfaces

## 6.1 User interfaces (UI)

### 6.1.1 Form factor and layout

- Mobile-first. Every authenticated screen is rendered inside a `max-w-md`
  centered container; desktop wraps that container with a soft phone-mockup
  shadow.
- Marketing pages (`/home`, `/features`, `/about`, `/install`, `/blog`) are
  full-width and responsive.
- Light mode only for MVP. The design system uses semantic tokens defined in
  `src/index.css` and `tailwind.config.ts`; **no raw colors in components**.
- Icons: **Hugeicons** only.
- Typography: see `mem://style/visual-identity`.

### 6.1.2 Navigation

- 7-tab bottom nav: Dashboard, Today, Iman, Health, Wealth, Productivity,
  Family. Tabs use the segmented control pattern in `BottomNav.tsx`.
- Subpages use `SubPageLayout` with history-aware back.
- Deep links restore the intended path through `post_auth_redirect`.

### 6.1.3 Accessibility

- WCAG 2.1 AA contrast and focus visibility.
- Apple HIG-compliant tap targets: minimum **44×44 pt**.
- Minimum body text size: per `mem://ui/accessibility-standards`.
- All interactive icons have `aria-label`.
- Forms use shadcn `Form` + react-hook-form + zod for accessible error
  messages.

## 6.2 Hardware / device interfaces (Capacitor plugins)

| Plugin | Use |
|--------|-----|
| `@capacitor/status-bar` | Set status bar style + emerald background on native. |
| `@capacitor/splash-screen` | Branded splash, manually hidden after boot. |
| `@capacitor/local-notifications` | Adhan, IF window, daily check-in nudges. |
| `@capacitor/haptics` | Dhikr counter ticks, button confirmations. |
| `@capacitor/share` | Share dakwah posters, blog links. |
| `@capacitor/clipboard` | Copy ayah text, family invite codes. |
| `@capacitor/network` | Drive the offline banner and sync triggers. |
| `@capacitor/preferences` | Small native-side prefs (locale, last route). |
| `@capacitor/device` | Diagnostics, build channel reporting. |
| `@capacitor/browser` | In-app browser for external links. |
| `@capacitor/keyboard` | Resize behavior on focus. |
| `@capacitor/app` | App state lifecycle, deep links. |

Abstraction layer: `src/utils/native/*` re-exports a typed, web-safe wrapper
around each plugin so screens remain platform-agnostic.

## 6.3 Software interfaces (APIs)

### 6.3.1 Internal — Supabase Edge Functions

All internal write APIs go through edge functions to centralize validation
and business rules. They are invoked via the typed wrapper in
`src/lib/api-client.ts`.

| Function | Domain | Notes |
|----------|--------|-------|
| `api-profile` | Profile, settings, account delete | Uses `verify_jwt = true`. |
| `api-checkin` | Daily check-in, streak award |  |
| `api-dhikr` | Dhikr session writes |  |
| `api-quran` | Reading logs, sessions, memorization |  |
| `api-salah` | Salah log writes |  |
| `api-sunnah` | Sunnah log writes |  |
| `api-health` | BMI, weight, hydration, sleep, IF, steps |  |
| `api-wealth` | Transactions, budgets, savings, income |  |
| `api-productivity` | Tasks, habits, life areas |  |
| `api-family` | Family create/join, members, feed |  |
| `api-admin` | Admin-only operations; checks `has_role` |  |
| `api-misc` | Catch-all small operations |  |
| `jakim-proxy` | Proxy to JAKIM e-Solat; **public** (`verify_jwt = false`) | Required to fetch prayer times before auth on the public landing pages. |

Standard response envelope:

```json
{ "ok": true, "data": { ... } }
{ "ok": false, "error": { "code": "string", "message": "string" } }
```

### 6.3.2 Internal — Direct Supabase

Read-only queries that benefit from RLS go directly through the Supabase JS
client (e.g., dashboard reads, list pages). Writes prefer edge functions for
validation, but small idempotent writes (`widget_preferences`,
`quick_log_preferences`) may use direct upserts.

### 6.3.3 External — Prayer times

- **JAKIM e-Solat** via `jakim-proxy` — used when user selects a Malaysian zone.
- **Aladhan** (`https://api.aladhan.com/v1/timings`) — used for any other location
  or method. Calls are made client-side; results are cached in localStorage for
  the day.

### 6.3.4 External — Auth

- **Google Identity** — OAuth 2.0. Client type **Web application**.
  Authorized JS origins and redirect URIs include `https://successmuslim.app`,
  the Lovable preview URL, and the Supabase auth callback URL.

### 6.3.5 External — Lovable AI Gateway (optional)

Available models include `google/gemini-2.5-flash`, `openai/gpt-5-mini`, etc.
No user-supplied API keys. Used for any AI-assisted feature without exposing
vendor specifics to users.

## 6.4 Communications interfaces

- All client ↔ server traffic is **HTTPS**.
- WebSocket: not used in MVP (no realtime subscriptions).
- App ↔ device: native plugin bridges only.
- Deep links:
  - `https://successmuslim.app/*` resolves to the app on web.
  - Android App Links: declared via `public/.well-known/assetlinks.json`.
  - iOS Universal Links: declared via `public/.well-known/apple-app-site-association`.
  - Custom scheme: not used (App Links / Universal Links preferred).

## 6.5 Configuration files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Native shell configuration (appId, plugins, splash). |
| `vite.config.ts` | Build configuration. |
| `tailwind.config.ts` | Design token surface. |
| `supabase/config.toml` | Per-function settings (e.g., `verify_jwt` on `jakim-proxy`). |
| `public/_redirects` | SPA routing fallback for the web host. |
| `public/.well-known/*` | App Links / Universal Links manifests. |
| `.env` | Auto-managed (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`). |