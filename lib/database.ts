/**
 * lib/database.ts
 *
 * Typed helper functions for all Supabase database operations.
 *
 * Rules:
 *  - READ helpers use the anon key client (supabase) — RLS enforced, user sees own data only.
 *  - WRITE helpers for user-initiated actions (e.g. saveRecipient) also use the anon key.
 *  - Transaction INSERT/UPDATE must use the service role key in API routes — not in this file.
 *
 * All functions throw on error so the caller can handle it with try/catch.
 */

import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// Types (match the schema in supabase/schema.sql exactly)
// ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_seen_at: string | null;
}

export interface Recipient {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  network: 'MTN' | 'TELECEL';
  created_at: string;
  last_used_at: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  recipient_id: string;
  gbp_amount: number;
  ghs_amount: number;
  exchange_rate: number;
  fee_gbp: number;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  reference_code: string;
  solana_signature: string | null;
  kotani_reference: string | null;
  created_at: string;
  delivered_at: string | null;
}

/** Transaction row joined with its recipient's display fields. Used in the dashboard. */
export interface TransactionWithRecipient extends Transaction {
  recipients: Pick<Recipient, 'full_name' | 'phone_number' | 'network'> | null;
}

// Input type for saving a recipient
export interface RecipientInput {
  full_name: string;
  phone_number: string;
  network: 'MTN' | 'TELECEL';
}

// ─────────────────────────────────────────────────────────────
// Profile helpers
// ─────────────────────────────────────────────────────────────

/**
 * Creates a new user profile on first login.
 * Called by the auth flow immediately after Web3Auth sign-in.
 * The profile id must match the Supabase auth user id (auth.uid()).
 */
export async function createProfile(userId: string, email: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, email })
    .select()
    .single();

  if (error) throw new Error(`createProfile failed: ${error.message}`);
  return data as Profile;
}

/**
 * Fetches the current user's profile.
 * Returns null if no profile exists yet (first login before profile creation).
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = "no rows returned" — expected if profile doesn't exist yet
    if (error.code === 'PGRST116') return null;
    throw new Error(`getProfile failed: ${error.message}`);
  }

  return data as Profile;
}

/**
 * Creates a profile if one doesn't exist, returns the existing one if it does.
 * Safe to call on every login.
 */
export async function upsertProfile(userId: string, email: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, last_seen_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`upsertProfile failed: ${error.message}`);
  return data as Profile;
}

// ─────────────────────────────────────────────────────────────
// Transaction helpers
// ─────────────────────────────────────────────────────────────

/**
 * Fetches the user's full transfer history, newest first.
 * Each row includes the recipient's name, phone, and network via a join.
 *
 * NOTE: Transaction INSERT is intentionally not here.
 * Writing transactions uses the service role key in /api/payout — not the anon client.
 */
export async function getTransactions(userId: string): Promise<TransactionWithRecipient[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, recipients(full_name, phone_number, network)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getTransactions failed: ${error.message}`);
  return (data ?? []) as TransactionWithRecipient[];
}

/**
 * Fetches a single transaction by reference code.
 * Used on the success screen to display confirmed transfer details.
 */
export async function getTransactionByRef(
  referenceCode: string
): Promise<TransactionWithRecipient | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, recipients(full_name, phone_number, network)')
    .eq('reference_code', referenceCode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`getTransactionByRef failed: ${error.message}`);
  }

  return data as TransactionWithRecipient;
}

// ─────────────────────────────────────────────────────────────
// Recipient helpers
// ─────────────────────────────────────────────────────────────

/**
 * Saves a new recipient for the current user.
 * Called after a successful transfer to auto-save the recipient.
 */
export async function saveRecipient(
  userId: string,
  details: RecipientInput
): Promise<Recipient> {
  const { data, error } = await supabase
    .from('recipients')
    .insert({ user_id: userId, ...details })
    .select()
    .single();

  if (error) throw new Error(`saveRecipient failed: ${error.message}`);
  return data as Recipient;
}

/**
 * Fetches all saved recipients for the user.
 * Ordered: most recently used first, then by creation date.
 */
export async function getRecipients(userId: string): Promise<Recipient[]> {
  const { data, error } = await supabase
    .from('recipients')
    .select('*')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getRecipients failed: ${error.message}`);
  return (data ?? []) as Recipient[];
}

/**
 * Updates a recipient's last_used_at timestamp.
 * Call this after each successful transfer to keep the "most recent" ordering correct.
 */
export async function touchRecipient(recipientId: string): Promise<void> {
  const { error } = await supabase
    .from('recipients')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', recipientId);

  if (error) throw new Error(`touchRecipient failed: ${error.message}`);
}
