import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// Push notification sending functions
async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  // In production, integrate with push services:
  // - APNS (Apple Push Notification Service)
  // - FCM (Firebase Cloud Messaging)

  console.log(`[Push] Sending to ${token}: ${title} - ${body}`);

  // Mock implementation - always succeed
  return true;
}

async function sendWeChatSubscription(
  openid: string,
  templateId: string,
  data: Record<string, any>
): Promise<boolean> {
  // In production, integrate with WeChat MP subscription message API
  console.log(`[WeChat] Sending to ${openid}: ${templateId}`, data);
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { user_id, task_id, type } = req.body;
    const authHeader = req.headers.authorization;

    if (!user_id || !task_id) {
      return res.status(400).json({ success: false, error: 'user_id and task_id are required' });
    }

    // Get task and user plant info
    const { data: task } = await supabase
      .from('care_tasks')
      .select('*, user_plant:user_plants(*)')
      .eq('id', task_id)
      .single();

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const userPlant = task.user_plant;
    const taskTypeLabels: Record<string, string> = {
      water: '浇水',
      fertilize: '施肥',
      repot: '换盆',
      prune: '修剪',
      custom: '护理'
    };

    const title = '🌱 养护提醒';
    const body = `${userPlant.nickname}需要${taskTypeLabels[task.task_type] || '护理'}啦！`;

    // Get user reminder config
    const { data: reminderConfig } = await supabase
      .from('reminder_configs')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Send push notification if enabled
    if (reminderConfig?.push_enabled) {
      // Get user device token (stored separately in production)
      const deviceToken = null; // Retrieve from database

      if (deviceToken) {
        await sendPushNotification(deviceToken, title, body, {
          task_id,
          plant_id: userPlant.id
        });
      }
    }

    // Send WeChat mini-program subscription message if enabled
    if (reminderConfig?.mini_program_subscription) {
      // Get user openid
      const { data: user } = await supabase
        .from('users')
        .select('auth_provider_id')
        .eq('id', user_id)
        .single();

      if (user?.auth_provider_id) {
        await sendWeChatSubscription(
          user.auth_provider_id,
          'TEMPLATE_ID', // Configure in WeChat MP
          {
            thing1: { value: userPlant.nickname },
            thing2: { value: taskTypeLabels[task.task_type] || '护理' }
          }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully'
    });

  } catch (error: any) {
    console.error('Send notification error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
