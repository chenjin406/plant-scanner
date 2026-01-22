import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    // Search in plant_species
    const { data: results, error, count } = await supabase
      .from('plant_species')
      .select('*', { count: 'exact' })
      .or(`common_name.ilike.%${q}%,scientific_name.ilike.%${q}%`)
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order('common_name');

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      data: results || [],
      total: count || 0
    });

  } catch (error: any) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
