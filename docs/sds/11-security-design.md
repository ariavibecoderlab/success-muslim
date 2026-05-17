# 11 · Security Design

## 11.1 Authentication

- Supabase Auth (GoTrue): email/password + Google OAuth.
- Google client type: **Web application** (required for Capacitor WebView
  compatibility).
- Session stored in `localStorage` via the Supabase client
  (`persistSession: true`, `autoRefreshToken: true`).
- Email-only signups (no phone, no anonymous, no magic link in MVP).
- HIBP password protection enabled at the Supabase project level
  (`mem://tech/security-hardening`).

## 11.2 Authorization

- Roles stored in `public.user_roles` (enum `app_role`:
  `admin | moderator | user`). **Never on `profiles`.**
- Checks via `public.has_role(_user_id, _role)` — SECURITY DEFINER,
  immutable from RLS recursion.
- Client-side admin gates (`AdminGuard`, `useAdmin`) call `has_role` and
  re-check on every navigation; they are **defense in depth**, not the
  primary control.

## 11.3 Row-Level Security

Every user-owned table is RLS-enabled with the four-policy template
(own row select/insert/update/delete) plus an admin read policy. Family
tables additionally allow members via `is_family_member()` and admins via
`is_family_admin()`. See SDS §5.3 and the SRS template for SQL.

## 11.4 Admin console

- Wrapped by `AdminGuard`.
- Blocked on small viewports by `MobileAdminBlock` (reduces shoulder
  surfing risk + accidental data exposure).
- Idle timeout via `useAdminTimeout` (forces re-auth after configurable
  inactivity).
- All sensitive reads go through `admin_*` SECURITY DEFINER RPCs that
  re-check `has_role(auth.uid(), 'admin')` server-side.
- Write actions emit rows into `admin_audit_log` via `useAdminAudit`.

## 11.5 Edge function security

- `verify_jwt = true` by default; only `jakim-proxy` is public.
- Each function re-derives the user id from the JWT (`getUser()`); the
  client cannot impersonate another `user_id`.
- Inputs validated with zod schemas; failures return
  `{ok:false, error:{code:'VALIDATION'}}`.
- Business-rule checks (backdate range, qada decrement bounds) happen
  server-side so a hostile client cannot bypass them.

## 11.6 Secrets

- Service-role keys, AI gateway keys, and DB URL live in Supabase
  secrets (`SUPABASE_*`, `LOVABLE_API_KEY`). Never shipped to the client.
- Publishable/anon key + URL are public by design and embedded via
  `.env` (`VITE_SUPABASE_*`).
- Secrets are listed via `secrets--fetch_secrets`; values are never
  echoed.

## 11.7 Transport

- All traffic HTTPS, including JAKIM proxy.
- Deep links use verified App Links (Android) and Universal Links (iOS)
  via `public/.well-known/*`. No custom schemes.
- Capacitor `server.hostname` is the production domain; mixed content
  is disabled.

## 11.8 Storage bucket policies

| Bucket | Read | Write |
|--------|------|-------|
| `avatars` | Own only (signed URL or RLS-equivalent on object metadata) | Own only |
| `dakwah-posters` | Public | Admin (`api-admin`) |
| `blog-images` | Public | Admin (`api-admin`) |
| `cms-uploads` | Public | Admin (`api-admin`) |

## 11.9 Account lifecycle

- **Create:** Supabase trigger `handle_new_user` inserts the
  `profiles` row and seeds `display_name`.
- **Delete:** `api-profile` calls `admin_delete_user(target_user_id)`
  (SECURITY DEFINER) which removes the auth row; cascades wipe
  user-owned data within 30 days per retention policy.
- **Export:** `api-profile export` returns a JSON blob of all
  user-owned rows (right to data portability).

## 11.10 Threat model (summary)

| Threat | Mitigation |
|--------|------------|
| Privilege escalation via UI tampering | Roles in `user_roles`; `has_role` SECURITY DEFINER; RLS enforces. |
| RLS recursion lockout | All role checks use SECURITY DEFINER helpers. |
| Replay of mutations on retry | Client UUID + upsert on natural key. |
| Cross-user data read | RLS `using (user_id = auth.uid())` on every owned table. |
| OAuth client misconfig (Capacitor) | Use Web application client type only. |
| Open redirect via post-auth | Allow only same-origin paths in `post_auth_redirect`. |
| Stored XSS in blog/CMS | Tiptap sanitization + DOMPurify on render of user HTML. |
| Admin token theft | Idle timeout, viewport block, audit log. |
| Public proxy abuse | `jakim-proxy` is rate-limited at the edge runtime; only proxies a whitelisted endpoint shape. |
| Storage hot-link of private assets | Avatars not public; signed URLs preferred. |

## 11.11 Compliance posture

- GDPR + Malaysia PDPA aligned: documented data classes, retention,
  export, and delete.
- Privacy policy + terms shipped under `docs/store-listings/`.
- App-store privacy disclosures (iOS `app-privacy-ios.md`, Android
  `data-safety-android.md`) match real data flows.