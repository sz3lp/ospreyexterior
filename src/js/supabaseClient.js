import { createClient } from '@supabase/supabase-js';

let client;

function getEnvironment() {
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  if (typeof window !== 'undefined' && window.process && window.process.env) {
    return window.process.env;
  }
  return {};
}

export function createSupabaseClient() {
  if (client) {
    return client;
  }

  const env = getEnvironment();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration.');
  }

  client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  return client;
}
