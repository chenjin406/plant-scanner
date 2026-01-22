import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Sentry
const SENTRY_DSN = process.env.SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development'
  });
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add Sentry tracing
  const transaction = SENTRY_DSN ? Sentry.startTransaction({
    name: `API ${req.method} ${req.url}`,
    op: 'http.server'
  }) : null;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { user_id, error_message, error_stack, page_url, user_agent } = req.body;

    // Store error in Supabase for analytics
    const { error } = await supabase.from('error_logs').insert({
      user_id: user_id || null,
      error_message,
      error_stack,
      page_url,
      user_agent,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Failed to log error:', error);
    }

    // Report to Sentry if DSN is configured
    if (SENTRY_DSN && error_message) {
      Sentry.captureException(new Error(error_message), {
        extra: {
          stack: error_stack,
          userAgent: user_agent
        }
      });
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Error logging error:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    if (transaction) {
      transaction.finish();
    }
  }
}
