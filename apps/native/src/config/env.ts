/**
 * Plant Scanner Native - Environment Configuration
 */

export const ENV = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  PLANTNET_API_KEY: process.env.PLANTNET_API_KEY || '',
  SENTRY_DSN: process.env.SENTRY_DSN || ''
};
