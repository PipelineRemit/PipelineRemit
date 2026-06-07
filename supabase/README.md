# Supabase Setup — PipelineRemit

This folder contains the database schema for PipelineRemit. Run `schema.sql` once in your Supabase project to create all tables, indexes, RLS policies, and helper functions.

---

## How to run the schema

### Step 1 — Open the SQL Editor

1. Go to [supabase.com](https://supabase.com) and open your PipelineRemit project
2. In the left sidebar, click **SQL Editor**
3. Click **New query**

### Step 2 — Paste and run

1. Open `supabase/schema.sql` from this repo
2. Select all and copy (`Cmd+A`, `Cmd+C`)
3. Paste into the SQL Editor
4. Click **Run** (or press `Cmd+Enter`)

You should see: `Success. No rows returned.`

### Step 3 — Verify the tables were created

Run this query to confirm all three tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
```
profiles
recipients
transactions
```

### Step 4 — Verify RLS policies

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

You should see 8 policies total — 3 on profiles, 4 on recipients, 1 on transactions.

### Step 5 — Test the reference code generator

```sql
SELECT public.generate_reference_code();
```

Expected output: something like `PR-2026-4821`

---

## What the schema creates

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | One record per user. ID matches Web3Auth JWT sub claim. |
| `recipients` | Saved recipient details per user. |
| `transactions` | One record per transfer attempt. Backend-write only. |

### Row Level Security

| Table | Who can read | Who can write |
|-------|-------------|---------------|
| `profiles` | Own record only | Own record only (insert + update) |
| `recipients` | Own records only | Own records only (insert, update, delete) |
| `transactions` | Own records only | Backend only (service role key) |

Transactions can only be written by the `/api/payout` backend route using `SUPABASE_SERVICE_ROLE_KEY`. No user can insert or modify transaction records directly from the frontend.

### Helper function

`public.generate_reference_code()` — returns a collision-free `PR-YYYY-XXXX` reference code. Call it from the backend before inserting a transaction:

```typescript
const { data: refCode } = await supabaseAdmin.rpc('generate_reference_code');
// returns e.g. "PR-2026-4821"
```

---

## Environment variables needed

Once the schema is applied, get these from the Supabase dashboard under **Settings → API**:

```env
# .env.local — never commit this file
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`NEXT_PUBLIC_*` variables are used in the frontend (safe — RLS enforced).  
`SUPABASE_SERVICE_ROLE_KEY` is used in backend API routes only — never expose this to the client.

---

## Re-running the schema

The schema uses `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and `CREATE OR REPLACE FUNCTION`, so it is safe to run multiple times without errors.

If you need to reset everything completely:

```sql
-- ⚠️ DESTRUCTIVE — drops all tables and data
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.recipients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.generate_reference_code();
```

Then re-run `schema.sql` from scratch.
