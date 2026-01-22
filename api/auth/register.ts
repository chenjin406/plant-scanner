import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

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
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, error: 'Phone and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone,
      password
    });

    if (authError) {
      return res.status(400).json({ success: false, error: authError.message });
    }

    // Create user profile
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user?.id,
      nickname: `用户${phone.slice(-4)}`,
      locale: 'zh-CN',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      auth_provider: 'phone',
      auth_provider_id: phone
    });

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user?.id!);
      return res.status(400).json({ success: false, error: profileError.message });
    }

    // Create reminder config for user
    await supabase.from('reminder_configs').insert({
      user_id: authData.user?.id,
      push_enabled: true,
      mini_program_subscription: false
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: authData.user?.id,
          phone
        },
        session: authData.session
      }
    });

  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
