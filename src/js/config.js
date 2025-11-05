function getEnvironment() {
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  if (typeof window !== 'undefined' && window.process && window.process.env) {
    return window.process.env;
  }
  return {};
}

const runtimeConfig =
  (typeof window !== 'undefined' && window.SUPABASE_CONFIG) || {};

const env = getEnvironment();

export const SUPABASE_TABLE =
  runtimeConfig.table || env.NEXT_PUBLIC_SUPABASE_TABLE || 'leads';

export const SUPABASE_NOTIFICATION_EMAIL =
  runtimeConfig.notificationEmail || env.NEXT_PUBLIC_LEAD_NOTIFICATION_EMAIL || '';

export const QUALIFICATION_ENDPOINT =
  env.NEXT_PUBLIC_LEAD_QUALIFICATION_URL ||
  'https://lead-flux.vercel.app/api/qualifyLead';
