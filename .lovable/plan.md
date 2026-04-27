# 📦 SAVED PLAN — Migrate Database to Standalone Supabase

> **Status:** ⏸️ Paused. User mahu develop dulu, sambung migration kemudian.

---

## ✅ Apa yang sudah siap

1. **Schema migration** — DONE
   - 56 tables, ~205 RLS policies, 27 functions, `app_role` enum, `on_auth_user_created` trigger
   - Files at `/mnt/documents/supabase-migration/`:
     - `migration-schema.sql` ✅ Applied
     - `storage-setup.sql` ✅ Applied (4 buckets)
     - `deploy-functions.sh` ✅ Ready
   - Guide: `docs/SUPABASE_MIGRATION.md`

2. **Note tentang foreign keys** — Memang sengaja tiada FK; relationships dikuruskan via RLS + Edge Function logic. Bukan bug.

---

## 🔜 Apa yang TINGGAL bila nak sambung

### A. Migrate data lama (~14,200 rows)
**Cara paling mudah** — single command pipe:
```bash
pg_dump \
  --data-only --no-owner --no-acl --schema=public \
  --exclude-table=schema_migrations \
  "postgresql://postgres:[OLD_PASSWORD]@db.tdjxnlhewdrajrffdsnh.supabase.co:5432/postgres" \
  | psql "postgresql://postgres:[NEW_PASSWORD]@db.[NEW_REF].supabase.co:5432/postgres"
```

Data summary:
- `quran_reading_sessions`: 13,449 rows
- `profiles`: 46
- `salah_logs`: 97
- `dhikr_sessions`: 87
- 37 lain-lain tables: ~500

### B. Migrate auth users (46 users)
3 pilihan:
1. **Supabase Support ticket** (cleanest) — email support@supabase.io
2. **Admin API script** (Node.js) — users perlu reset password, tapi UUID kekal
3. **Skip** — users register semula, data lama jadi orphan

### C. Cutover
1. Lovable → Connectors → **Disable Lovable Cloud** ⚠️ (irreversible)
2. Connectors → **Connect Supabase** (paste URL + anon key baru)
3. `client.ts`, `types.ts`, `.env` auto-regenerate
4. Test: signup, login, Google OAuth, salah log, family, admin

### D. Setup auth di project baru (kalau belum)
- Email provider + HIBP
- Google OAuth (paste existing client ID/secret + tambah callback URL baru ke Google Cloud Console)
- Site URL: `https://successmuslim.app`
- Redirect URLs: `successmuslim.app/**`, `success-muslim.lovable.app/**`, `localhost:8080/**`, `app.lovable.b9a116fef80b4255b0618b5d84d41884://**`

---

## 🚀 Bila nak sambung

Cuma cakap salah satu:
- **"Sambung migration"** — saya panduan dari Step A
- **"Generate auth migration script"** — saya buat Node.js script untuk migrate 46 users
- **"Saya dah migrate data, nak cutover"** — saya guide Step C

Sementara itu — **happy developing!** 🎯
Project sekarang masih jalan atas Lovable Cloud, jadi semua development normal macam biasa.