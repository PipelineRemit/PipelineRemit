/**
 * app/api/payout/route.ts
 *
 * POST /api/payout
 *
 * Initiates a GHS mobile money payout via Kotani Pay.
 *
 * Security:
 *  - Requires a valid Supabase JWT in the Authorization header
 *  - Validates all input fields before calling Kotani Pay
 *  - Uses service role key for Supabase writes (bypasses RLS correctly)
 *  - Never logs full phone numbers
 *
 * On success:
 *  - Calls Kotani Pay POST /api/v3/offramp
 *  - Writes a transaction record to Supabase (status: 'processing')
 *  - Returns { success: true, reference, kotaniReference }
 *
 * Status codes:
 *  400 — invalid input
 *  401 — missing or invalid auth token
 *  402 — Kotani Pay payout failed
 *  500 — unexpected server error
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const KOTANI_API_URL = 'https://api.kotanipay.io/api/v3/offramp';

// ─── Input validation ────────────────────────────────────────────────────────

const REFERENCE_RE = /^PR-\d{4}-\d{4}$/;
// Accepts +233XXXXXXXXX or 0XXXXXXXXX (9–10 digits after prefix)
const PHONE_RE = /^(\+233|0)\d{9,10}$/;

interface PayoutBody {
  phoneNumber: string;
  network: string;
  ghsAmount: number;
  gbpAmount: number;
  reference: string;
}

function validateBody(body: unknown): { valid: true; data: PayoutBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.phoneNumber !== 'string' || !PHONE_RE.test(b.phoneNumber.trim())) {
    return { valid: false, error: 'phoneNumber must be a valid Ghanaian number (+233... or 0...)' };
  }
  if (b.network !== 'MTN' && b.network !== 'TELECEL') {
    return { valid: false, error: 'network must be MTN or TELECEL' };
  }
  if (typeof b.ghsAmount !== 'number' || b.ghsAmount <= 0) {
    return { valid: false, error: 'ghsAmount must be a positive number' };
  }
  if (typeof b.gbpAmount !== 'number' || b.gbpAmount <= 0) {
    return { valid: false, error: 'gbpAmount must be a positive number' };
  }
  if (typeof b.reference !== 'string' || !REFERENCE_RE.test(b.reference.trim())) {
    return { valid: false, error: 'reference must match format PR-YYYY-XXXX' };
  }

  return {
    valid: true,
    data: {
      phoneNumber: (b.phoneNumber as string).trim(),
      network: b.network as 'MTN' | 'TELECEL',
      ghsAmount: b.ghsAmount as number,
      gbpAmount: b.gbpAmount as number,
      reference: (b.reference as string).trim(),
    },
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Auth — verify Bearer token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse + validate body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateBody(rawBody);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { phoneNumber, network, ghsAmount, gbpAmount, reference } = validation.data;

  // Mask phone for logging — show country code + last 3 digits only
  const phoneMasked = `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-3)}`;
  console.log(`[payout] Request received — user: ${user.id}, amount: GHS ${ghsAmount} (£${gbpAmount}), network: ${network}, phone: ${phoneMasked}`);

  // 3. Call Kotani Pay
  console.log('[payout] Calling Kotani Pay...');

  let kotaniResponse: { reference?: string; status?: string; message?: string };
  try {
    const kotaniRes = await fetch(KOTANI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KOTANI_API_KEY}`,
      },
      body: JSON.stringify({
        phoneNumber,
        network,
        amount: ghsAmount,
        currency: 'GHS',
        reference,
      }),
    });

    kotaniResponse = await kotaniRes.json();
    console.log('[payout] Kotani Pay response:', JSON.stringify(kotaniResponse));

    if (!kotaniRes.ok) {
      console.error('[payout] Kotani Pay error:', kotaniResponse.message ?? kotaniRes.status);
      return Response.json(
        { error: kotaniResponse.message ?? 'Payout failed' },
        { status: 402 }
      );
    }
  } catch (err) {
    console.error('[payout] Kotani Pay fetch failed:', err);
    return Response.json({ error: 'Payout provider unreachable' }, { status: 500 });
  }

  // 4. Write transaction to Supabase
  const { error: dbError } = await supabase.from('transactions').insert({
    user_id: user.id,
    recipient_id: null,
    gbp_amount: gbpAmount,
    ghs_amount: ghsAmount,
    exchange_rate: ghsAmount / gbpAmount,
    fee_gbp: gbpAmount * 0.05,
    solana_signature: null,
    kotani_reference: kotaniResponse.reference ?? null,
    status: 'processing',
    reference_code: reference,
  });

  if (dbError) {
    // Payout succeeded — log the DB error but don't fail the request
    console.error('[payout] Failed to write transaction:', dbError.message);
  } else {
    console.log('[payout] Transaction written — ref:', reference);
  }

  return Response.json({
    success: true,
    reference,
    kotaniReference: kotaniResponse.reference ?? null,
  });
}
