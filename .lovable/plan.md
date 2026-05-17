## Goal

Produce a complete, restorable backup of the Lovable Cloud backend for Success Muslim, written to `/mnt/documents/backup-<timestamp>/` and delivered as a single downloadable zip.

## What gets backed up

| Category | Source | Output file(s) |
|---|---|---|
| Database schema | `pg_dump --schema-only` via `$PGHOST` | `db/schema.sql` |
| Database data | `pg_dump --data-only --inserts` (public schema only) | `db/data.sql` |
| Per-table CSVs (human-readable) | `COPY ... TO STDOUT CSV HEADER` for every public table | `db/csv/<table>.csv` |
| RLS policies | `pg_policies` query | `db/rls-policies.json` + `db/rls-policies.md` |
| Functions / triggers | `pg_proc` + `information_schema.triggers` | `db/functions.sql`, `db/triggers.sql` |
| Enums & types | `pg_type` query | `db/types.sql` |
| Indexes | `pg_indexes` | `db/indexes.sql` |
| Auth users | `SELECT id,email,created_at,last_sign_in_at,raw_user_meta_data,raw_app_meta_data,confirmed_at FROM auth.users` (no password hashes — those are not retrievable) | `auth/users.json` + `auth/users.csv` |
| User roles | `public.user_roles` | already in CSVs + `auth/roles.csv` |
| Storage bucket metadata | `storage.buckets`, `storage.objects` listing | `storage/buckets.json`, `storage/objects-<bucket>.csv` |
| Storage files (binaries) | Download every object from each bucket via Supabase Storage API using service role key | `storage/files/<bucket>/<path>` |
| Edge functions source | Copy `supabase/functions/**` from repo | `edge-functions/` |
| `supabase/config.toml` | Copy from repo | `config/config.toml` |
| Secret names (values not retrievable) | List of secret names from `secrets--fetch_secrets` | `secrets/secret-names.md` |
| Migrations history | `supabase/migrations/**` from repo | `migrations/` |
| Generated TS types | `src/integrations/supabase/types.ts` | `types/types.ts` |
| SRS + SDS docs | `docs/srs/`, `docs/sds/` | `docs/` |
| Manifest | Counts, sizes, timestamp, project ref | `MANIFEST.md` |

## What CANNOT be backed up (documented in MANIFEST)

- **Auth password hashes** — never exposed via API or SQL to clients; only Supabase platform-level project export can move these.
- **Secret values** (`SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, etc.) — write-only by design. Names only.
- **JWT signing keys** — managed by Supabase.
- **Realtime / cron job state** — none configured beyond what's in `config.toml`.

## How

Single Node/bash script run via `code--exec`. Uses:
- `psql` with the session's `PG*` env vars for SQL dumps (read+insert access is sufficient for `SELECT`/`COPY TO STDOUT`).
- `pg_dump` if available in the sandbox; falls back to per-object SQL reconstruction queries if not.
- `curl` with `SUPABASE_SERVICE_ROLE_KEY` for storage downloads (`/storage/v1/object/<bucket>/<path>`) and auth admin listing (`/auth/v1/admin/users`).
- `zip` (via `nix run nixpkgs#zip`) to package the final artifact.

## Deliverables

- `/mnt/documents/backup-<UTC-timestamp>/` — full tree.
- `/mnt/documents/successmuslim-backup-<UTC-timestamp>.zip` — single download.
- A `<presentation-artifact>` tag pointing at the zip.
- `MANIFEST.md` listing every file, row counts per table, byte sizes per bucket, and a restore guide (how to re-apply schema, re-import data, re-upload storage, re-create users via admin API with the exported metadata — noting password reset will be required).

## Restore notes (included in MANIFEST.md)

1. New Supabase project → run `db/schema.sql` → `db/functions.sql` → `db/triggers.sql` → `db/data.sql`.
2. Re-create storage buckets from `storage/buckets.json`, then re-upload `storage/files/**`.
3. Re-create auth users via `/auth/v1/admin/users` POST using `auth/users.json` (passwords lost → users must reset).
4. Re-deploy `edge-functions/**` and re-add secrets manually from `secrets/secret-names.md`.

## Out of scope

- No code changes.
- No DB writes (read-only backup).
- No attempt to exfiltrate secret values.
