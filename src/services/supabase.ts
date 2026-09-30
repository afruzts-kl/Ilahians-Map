import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Fallback dummy client if credentials not supplied
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

/**
 * Health check to verify live connectivity with Supabase backend
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).'
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
