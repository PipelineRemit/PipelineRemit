-- ============================================================
-- PipelineRemit — Supabase Database Schema
-- ============================================================
-- Paste this entire file into the Supabase SQL Editor and click
-- Run. See supabase/README.md for step-by-step instructions.
--
-- Tables:    profiles · recipients · transactions
-- Security:  Row Level Security enabled on all tables
-- Extras:    Indexes for common queries, reference code generator
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

-- Provides gen_random_uuid() on older Postgres versions.
-- Supabase enables this by default; included here as a safeguard.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- TABLE: profiles
-- ============================================================
-- One record per user.
-- id matches the Web3Auth JWT sub claim (= Supabase auth.uid()).

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID         PRIMARY KEY,          -- set to auth.uid() on insert
  email         TEXT         NOT NULL,
  full_name     TEXT,                              -- nullable: user can set later
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ                        -- updated on each app open
);

COMMENT ON TABLE  public.profiles             IS 'One record per registered user.';
COMMENT ON COLUMN public.profiles.id          IS 'Matches the Web3Auth / Supabase auth user ID.';
COMMENT ON COLUMN public.profiles.last_seen_at IS 'Updated by the backend each time the user opens the app.';


-- ============================================================
-- TABLE: recipients
-- ============================================================
-- Saved recipients belonging to a user.
-- network is constrained to the two supported Ghanaian networks.

CREATE TABLE IF NOT EXISTS public.recipients (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name     TEXT         NOT NULL,
  phone_number  TEXT         NOT NULL,
  network       TEXT         NOT NULL CHECK (network IN ('MTN', 'TELECEL')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ                        -- updated after each transfer to this recipient
);

COMMENT ON TABLE  public.recipients              IS 'Saved recipient details per user.';
COMMENT ON COLUMN public.recipients.network      IS 'Must be MTN or TELECEL.';
COMMENT ON COLUMN public.recipients.last_used_at IS 'Updated by the backend after each successful transfer.';


-- ============================================================
-- TABLE: transactions
-- ============================================================
-- One record per transfer attempt.
-- All writes go through the /api/payout backend route using the
-- service role key — no direct frontend writes are permitted.

CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID            NOT NULL REFERENCES public.profiles(id)  ON DELETE RESTRICT,
  recipient_id      UUID            NOT NULL REFERENCES public.recipients(id) ON DELETE RESTRICT,

  -- Amounts
  gbp_amount        DECIMAL(10, 2)  NOT NULL CHECK (gbp_amount  > 0),
  ghs_amount        DECIMAL(12, 2)  NOT NULL CHECK (ghs_amount  > 0),
  exchange_rate     DECIMAL(10, 5)  NOT NULL CHECK (exchange_rate > 0),
  fee_gbp           DECIMAL(10, 2)  NOT NULL CHECK (fee_gbp     >= 0),

  -- Status
  status            TEXT            NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'processing', 'delivered', 'failed')),

  -- References
  reference_code    TEXT            NOT NULL UNIQUE,  -- format: PR-YYYY-XXXX
  solana_signature  TEXT,                             -- blockchain transit reference
  kotani_reference  TEXT,                             -- Kotani Pay payout reference

  -- Timestamps
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  delivered_at      TIMESTAMPTZ                       -- set by webhook when Kotani confirms delivery
);

COMMENT ON TABLE  public.transactions                 IS 'One record per transfer. Backend-write only.';
COMMENT ON COLUMN public.transactions.reference_code  IS 'Human-readable reference shown to users: PR-YYYY-XXXX.';
COMMENT ON COLUMN public.transactions.solana_signature IS 'Solana Devnet transaction signature for blockchain transit.';
COMMENT ON COLUMN public.transactions.kotani_reference IS 'Kotani Pay payout reference returned by their API.';
COMMENT ON COLUMN public.transactions.delivered_at    IS 'Populated by the Kotani Pay webhook on confirmed delivery.';


-- ============================================================
-- INDEXES
-- ============================================================

-- Recipient lookups by owner (most common query on recipient screen)
CREATE INDEX IF NOT EXISTS idx_recipients_user_id
  ON public.recipients (user_id);

-- Transaction history queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON public.transactions (user_id);

-- Newest-first ordering for history screen
CREATE INDEX IF NOT EXISTS idx_transactions_user_created
  ON public.transactions (user_id, created_at DESC);

-- Recipient-level history
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id
  ON public.transactions (recipient_id);

-- Status filtering (e.g. "show all pending/processing")
CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON public.transactions (status)
  WHERE status IN ('pending', 'processing');


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;


-- ── profiles ─────────────────────────────────────────────────

-- Read own profile
CREATE POLICY "profiles: users can read own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create own profile on first login (backend calls this with anon key)
CREATE POLICY "profiles: users can insert own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update own profile (name, etc.)
CREATE POLICY "profiles: users can update own"
  ON public.profiles
  FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── recipients ───────────────────────────────────────────────

-- Read own saved recipients
CREATE POLICY "recipients: users can read own"
  ON public.recipients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Save a new recipient
CREATE POLICY "recipients: users can insert own"
  ON public.recipients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Edit a saved recipient
CREATE POLICY "recipients: users can update own"
  ON public.recipients
  FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete a saved recipient
CREATE POLICY "recipients: users can delete own"
  ON public.recipients
  FOR DELETE
  USING (auth.uid() = user_id);


-- ── transactions ─────────────────────────────────────────────

-- Read own transaction history
CREATE POLICY "transactions: users can read own"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT / UPDATE are intentionally omitted from user-facing policies.
-- All writes use the SUPABASE_SERVICE_ROLE_KEY in the /api/payout
-- backend route, which bypasses RLS entirely. This prevents any
-- possibility of a user writing or modifying transaction records
-- directly from the frontend.


-- ============================================================
-- HELPER: generate_reference_code()
-- ============================================================
-- Generates a collision-free reference in the format PR-YYYY-XXXX.
-- Called by the /api/payout backend route when creating a transaction.
--
-- Usage (from SQL):
--   SELECT public.generate_reference_code();
--
-- Usage (from the backend):
--   const { data } = await supabase.rpc('generate_reference_code');

CREATE OR REPLACE FUNCTION public.generate_reference_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as the function owner, not the calling role
AS $$
DECLARE
  v_year TEXT;
  v_rand TEXT;
  v_code TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  LOOP
    v_rand := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
    v_code := 'PR-' || v_year || '-' || v_rand;
    -- Retry if this code already exists (collision avoidance)
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.transactions WHERE reference_code = v_code
    );
  END LOOP;
  RETURN v_code;
END;
$$;

COMMENT ON FUNCTION public.generate_reference_code() IS
  'Returns a unique PR-YYYY-XXXX reference code. Call from the backend before inserting a transaction.';


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these after the schema is applied to confirm everything
-- was created correctly.

-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   ORDER BY table_name;

-- SELECT tablename, policyname, cmd
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, cmd;

-- SELECT public.generate_reference_code();
