import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// OTP storage (shared with send-code)
declare global {
  var otpStorage: Map<string, { code: string; expires: number }>;
}

if (!global.otpStorage) {
  global.otpStorage = new Map();
}

const otpStorage = global.otpStorage;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { phone, code, type } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'Phone and code are required' });
    }

    // Verify OTP
    const stored = otpStorage.get(phone);

    if (!stored) {
      return res.status(400).json({ success: false, error: 'OTP expired or not requested' });
    }

    if (Date.now() > stored.expires) {
      otpStorage.delete(phone);
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }

    if (code !== stored.code && process.env.NODE_ENV !== 'development') {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    // Clear OTP
    otpStorage.delete(phone);

    if (type === 'login') {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_provider_id', phone)
        .single();

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          need_register: true
        });
      }

      // Sign in with phone (OTP verified)
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        phone
      });

      if (authError) {
        return res.status(400).json({ success: false, error: authError.message });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: existingUser,
          session: authData.session
        }
      });
    }

    if (type === 'register') {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_provider_id', phone)
        .single();

      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Phone already registered' });
      }

      return res.status(200).json({
        success: true,
        message: 'OTP verified, proceed to set password'
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid type' });

  } catch (error: any) {
    console.error('Verify code error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
