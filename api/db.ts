import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { id, table, user_id, filter, limit = 50, offset = 0 } = query;

  // Validate table access
  const allowedTables = ['plant_species', 'user_plants', 'care_tasks', 'scan_records'];
  if (!table || !allowedTables.includes(table as string)) {
    return res.status(400).json({ success: false, error: 'Invalid table' });
  }

  const tableName = table as string;

  // Build query
  let query = supabase.from(tableName).select('*');

  if (id) {
    query = query.eq('id', id).single();
  }

  if (user_id) {
    query = query.eq('user_id', user_id);
  }

  if (filter) {
    try {
      const filterObj = JSON.parse(filter as string);
      Object.entries(filterObj).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    } catch (e) {
      // Ignore invalid filter
    }
  }

  if (limit) {
    query = query.limit(Number(limit));
  }

  if (offset) {
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, data });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { table, data } = body;

  const allowedTables = ['user_plants', 'care_tasks', 'scan_records', 'reminder_configs'];
  if (!table || !allowedTables.includes(table)) {
    return res.status(400).json({ success: false, error: 'Invalid table' });
  }

  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, data: result });
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  const { table, id, data } = body;

  if (!table || !id) {
    return res.status(400).json({ success: false, error: 'Table and id are required' });
  }

  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, data: result });
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { table, id } = query;

  if (!table || !id) {
    return res.status(400).json({ success: false, error: 'Table and id are required' });
  }

  const { error } = await supabase.from(table as string).delete().eq('id', id);

  if (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, message: 'Deleted successfully' });
}
