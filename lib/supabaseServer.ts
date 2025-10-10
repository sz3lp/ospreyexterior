import { createClient } from '@supabase/supabase-js';

const getSupabaseCredentials = () => {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey } as const;
};

export const supabaseServerClient = () => {
  const credentials = getSupabaseCredentials();

  if (!credentials) {
    throw new Error('Supabase credentials are missing.');
  }

  return createClient(credentials.supabaseUrl, credentials.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export const hasSupabaseCredentials = () => Boolean(getSupabaseCredentials());
