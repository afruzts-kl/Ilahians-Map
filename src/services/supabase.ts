import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve environment variables supporting Vercel Supabase integration
// (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
// as well as standard Vite environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
// IMPORTANT: Only client-safe public keys are read here; server-side secrets are never accessed.
export const supabaseUrl =
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  '';

export const supabaseAnonKey =
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Create Supabase client only when configured; otherwise null
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Health check to verify live connectivity with Supabase backend
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables.'
    };
  }

  const startTime = Date.now();
  try {
    const { error } = await supabase.from('locations').select('id').limit(1);
    const latencyMs = Date.now() - startTime;
    if (error) {
      return {
        connected: false,
        message: `Connected to Supabase, but query returned: ${error.message}`,
        latencyMs
      };
    }
    return {
      connected: true,
      message: 'Successfully connected to Supabase PostgreSQL database!',
      latencyMs
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err?.message || 'Network error'}`
    };
  }
}

/**
 * Get the Supabase client, throwing if not configured
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}
