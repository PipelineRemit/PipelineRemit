/**
 * app/api/webhook/route.ts
 *
 * POST /api/webhook
 *
 * Receives SUCCESS/FAILED callbacks from Kotani Pay and updates the
 * corresponding transaction's status in Supabase.
 *
 * Kotani Pay sends a JSON payload with at minimum:
 *   { reference: string, status: 'SUCCESS' | 'FAILED' }
 *
 * Status mapping:
 *   SUCCESS → 'delivered'
 *   FAILED  → 'failed'
 *
 * Uses the service role key — must bypass RLS to update any transaction row.
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[webhook] Kotani Pay callback received:', JSON.stringify(body));

    const { reference, status } = body as { reference?: string; status?: string };

    if (!reference || !status) {
      return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const mappedStatus: 'delivered' | 'failed' = status === 'SUCCESS' ? 'delivered' : 'failed';

    const { error } = await supabase
      .from('transactions')
      .update({ status: mappedStatus })
      .eq('kotani_reference', reference);

    if (error) {
      console.error('[webhook] Failed to update transaction:', error.message);
      return Response.json({ error: 'Database update failed' }, { status: 500 });
    }

    console.log('[webhook] Transaction updated:', reference, '→', mappedStatus);
    return Response.json({ received: true }, { status: 200 });

  } catch (err) {
    console.error('[webhook] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
