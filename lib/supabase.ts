/**
 * lib/supabase.ts
 *
 * Exports a singleton Supabase browser client for use in client components
 * and API routes that only need the anon key (RLS-enforced reads).
 *
 * For server-side writes (e.g. /api/payout) that must bypass RLS, create a
 * separate admin client inside the API route using the SUPABASE_SERVICE_ROLE_KEY:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *   const supabaseAdmin = createClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.SUPABASE_SERVICE_ROLE_KEY!
 *   );
 *
 * The service role key must never appear in this file or any NEXT_PUBLIC_ variable.
 */

import { createClient } from '@supabase/supabase-js';

// Resolved at build time by Next.js — safe to expose to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Warn loudly in development if the real values haven't been added yet.
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    console.warn(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL is not configured.\n' +
        'Open .env.local and add your Supabase project URL.\n' +
        'Find it in: Supabase Dashboard → Settings → API → Project URL'
    );
  }
  if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon')) {
    console.warn(
      '[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.\n' +
        'Open .env.local and add your anon/public key.\n' +
        'Find it in: Supabase Dashboard → Settings → API → Project API Keys'
    );
  }
}

/**
 * The singleton Supabase client.
 * Falls back to placeholder values so the app builds and runs without crashing
 * when the real keys haven't been added yet. All API calls will return empty
 * results or auth errors until real keys are configured.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key'
);

/**
 * True when real Supabase credentials are present.
 * Use this to skip DB calls in components during the setup phase,
 * rather than letting calls fail silently.
 */
export const isSupabaseConfigured =
  !!supabaseUrl &&
  !supabaseUrl.includes('your-project') &&
  !!supabaseAnonKey &&
  !supabaseAnonKey.includes('your-anon');
