import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// In-memory OTP storage (use Redis in production)
const otpStorage = new Map<string, { code: string; expires: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Supabase (mock - use Twilio/SMS service in production)
async function sendSMS(phone: string, code: string): Promise<boolean> {
  console.log(`[SMS] Sending OTP ${code} to ${phone}`);

  // In production, integrate with SMS service like:
  // - Twilio
  // - Aliyun SMS
  // - Tencent Cloud SMS

  // For demo, always succeed
  return true;
}

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
    const { phone, type } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }

    // Generate OTP
    const code = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStorage.set(phone, { code, expires });

    // Send SMS
    const sent = await sendSMS(phone, code);

    if (!sent) {
      return res.status(500).json({ success: false, error: 'Failed to send SMS' });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Debug only - remove in production
      debug_code: process.env.NODE_ENV === 'development' ? code : undefined
    });

  } catch (error: any) {
    console.error('Send code error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
