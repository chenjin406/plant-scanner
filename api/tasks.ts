import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// Calculate next due date based on frequency
function calculateNextDue(frequencyDays: number): Date {
  const next = new Date();
  next.setDate(next.getDate() + frequencyDays);
  return next;
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
    const { user_plant_id, species_care_profile, custom_tasks } = req.body;

    if (!user_plant_id) {
      return res.status(400).json({ success: false, error: 'user_plant_id is required' });
    }

    const tasks = [];
    const careProfile = species_care_profile || {};

    // Generate default tasks from care profile
    if (careProfile.water_frequency_days) {
      tasks.push({
        user_plant_id,
        task_type: 'water',
        next_due_at: calculateNextDue(careProfile.water_frequency_days).toISOString(),
        frequency_days: careProfile.water_frequency_days,
        reminder_enabled: true,
        status: 'pending'
      });
    }

    if (careProfile.fertilizer_frequency_days) {
      tasks.push({
        user_plant_id,
        task_type: 'fertilize',
        next_due_at: calculateNextDue(careProfile.fertilizer_frequency_days).toISOString(),
        frequency_days: careProfile.fertilizer_frequency_days,
        reminder_enabled: true,
        status: 'pending'
      });
    }

    if (careProfile.repotting_frequency_months) {
      const repotDate = new Date();
      repotDate.setMonth(repotDate.getMonth() + careProfile.repotting_frequency_months);
      tasks.push({
        user_plant_id,
        task_type: 'repot',
        next_due_at: repotDate.toISOString(),
        reminder_enabled: true,
        status: 'pending'
      });
    }

    // Add custom tasks if provided
    if (custom_tasks && Array.isArray(custom_tasks)) {
      custom_tasks.forEach((task: any) => {
        tasks.push({
          user_plant_id,
          task_type: 'custom',
          custom_name: task.name,
          next_due_at: task.due_at || calculateNextDue(7).toISOString(),
          frequency_days: task.frequency_days,
          reminder_enabled: task.reminder_enabled ?? true,
          status: 'pending'
        });
      });
    }

    // Insert all tasks
    const { data, error } = await supabase
      .from('care_tasks')
      .insert(tasks)
      .select();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      data,
      message: `Created ${tasks.length} care tasks`
    });

  } catch (error: any) {
    console.error('Task generation error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
