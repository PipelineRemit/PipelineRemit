/**
 * app/api/rates/route.ts
 *
 * GET /api/rates
 *
 * Returns the current spread-adjusted GBP→GHS exchange rate.
 * The raw API key and mid-market rate never leave the server.
 *
 * Response shape:
 *   { rate: number, fetchedAt: number, isFallback: boolean }
 *
 * rate       — the spread-adjusted rate to show the user (2.2% below mid-market)
 * fetchedAt  — Unix timestamp (ms) of when the rate was last fetched
 * isFallback — true when the API was unreachable and a cached/default rate is used
 */

import { NextResponse } from 'next/server';
import { getSpreadRate } from '@/lib/rates';

export async function GET() {
  const { rate, fetchedAt, isFallback } = await getSpreadRate();

  return NextResponse.json(
    { rate, fetchedAt, isFallback },
    {
      headers: {
        // Allow the browser to cache this response for 5 minutes.
        // The server-side cache is 10 minutes, so this is a safe subset.
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    }
  );
}
