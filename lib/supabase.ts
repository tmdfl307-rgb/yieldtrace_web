import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials are meaningfully configured (not empty and not default placeholders)
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project-id') || supabaseUrl.includes('your-supabase-project')) return false;
  if (supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('your-supabase-anon-key')) return false;
  return true;
};

// Create Supabase Client
// Even if unconfigured during initial run, instantiate with fallback values to prevent runtime crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
