/**
 * lib/rates.ts
 *
 * Fetches the live GBP/GHS mid-market rate from ExchangeRate-API and applies
 * a 2.2% spread before returning it. The spread is how PipelineRemit earns —
 * it is invisible to the user; no separate fee is charged.
 *
 * Spread mechanics:
 *   spread rate = live rate × 0.978
 *   e.g. live rate 17.00 → user sees 16.626
 *
 * Caching strategy:
 *   - In-process: module-level cache, valid for 10 minutes
 *   - HTTP layer: Next.js fetch cache with revalidate: 600 (10 min)
 *   Both layers ensure the external API is called at most once per
 *   10-minute window, even under high traffic.
 *
 * Server-side only — import this only from API routes or server components.
 * The EXCHANGERATE_API_KEY env var has no NEXT_PUBLIC_ prefix and is
 * never sent to the browser.
 */

const SPREAD_FACTOR = 0.978; // 2.2% spread (1 - 0.022)
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
const FALLBACK_RATE = 16.856; // used only when the API is unreachable

export interface SpreadRate {
  /** Spread-adjusted rate to display to the user */
  rate: number;
  /** Unix timestamp (ms) of when this rate was fetched */
  fetchedAt: number;
  /** True if this is a stale/fallback rate rather than a live one */
  isFallback: boolean;
}

// In-process cache — survives across requests within the same Node.js instance
let cachedRate: number | null = null;
let cachedAt = 0;

/**
 * Returns the current spread-adjusted GBP→GHS rate.
 * Reads from the in-process cache if fresh, otherwise fetches from the API.
 * Throws only if the API call fails AND there is no cache to fall back on.
 */
export async function getSpreadRate(): Promise<SpreadRate> {
  const now = Date.now();

  // Return cached value if still within TTL
  if (cachedRate !== null && now - cachedAt < CACHE_TTL_MS) {
    return { rate: cachedRate, fetchedAt: cachedAt, isFallback: false };
  }

  const apiKey = process.env.EXCHANGERATE_API_KEY;

  if (!apiKey || apiKey === 'your_key_here') {
    console.warn(
      '[rates] EXCHANGERATE_API_KEY not set — using fallback rate. ' +
        'Add your key to .env.local to see live rates.'
    );
    return { rate: FALLBACK_RATE, fetchedAt: now, isFallback: true };
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/GBP/GHS`,
      {
        // Next.js data cache: revalidate every 10 minutes at the framework level.
        // This is effective on Vercel where each Lambda invocation may be cold.
        next: { revalidate: 600 },
      }
    );

    if (!res.ok) {
      throw new Error(`ExchangeRate-API responded with HTTP ${res.status}`);
    }

    const data: {
      result: string;
      conversion_rate: number;
      'error-type'?: string;
    } = await res.json();

    if (data.result !== 'success') {
      throw new Error(`ExchangeRate-API error: ${data['error-type'] ?? 'unknown'}`);
    }

    const liveRate = data.conversion_rate;
    const spreadRate = parseFloat((liveRate * SPREAD_FACTOR).toFixed(5));

    // Update in-process cache
    cachedRate = spreadRate;
    cachedAt = now;

    return { rate: spreadRate, fetchedAt: now, isFallback: false };
  } catch (err) {
    // If we have a stale cached rate, return it rather than crashing
    if (cachedRate !== null) {
      console.error('[rates] API fetch failed — returning stale cached rate:', err);
      return { rate: cachedRate, fetchedAt: cachedAt, isFallback: true };
    }

    // Absolute last resort: hardcoded fallback
    console.error('[rates] API fetch failed — returning hardcoded fallback rate:', err);
    return { rate: FALLBACK_RATE, fetchedAt: now, isFallback: true };
  }
}
