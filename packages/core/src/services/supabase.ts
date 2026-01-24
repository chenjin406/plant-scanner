import { createClient, SupabaseClient, Session, Provider } from '@supabase/supabase-js';
import { getEnv } from '../utils/env';
import type { 
  User, 
  UserPlant, 
  ScanRecord, 
  CareTask, 
  CareProfile, 
  ReminderConfig 
} from '../types';

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY || 'your-anon-key'
);

// Auth helpers
export const auth = {
  // Sign up with phone
  signUpWithPhone: async (phone: string, password: string) => {
    return supabase.auth.signUp({
      phone,
      password
    });
  },

  // Sign in with phone (OTP or password)
  signInWithPhone: async (phone: string, password?: string) => {
    if (password) {
      return supabase.auth.signInWithPassword({
        phone,
        password
      });
    }
    // Send OTP for passwordless sign-in
    return supabase.auth.signInWithOtp({ phone });
  },

  // Sign in with OAuth (WeChat, Apple, Google)
  signInWithOAuth: async (provider: 'wechat' | 'apple' | 'google') => {
    return supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
      }
    });
  },

  // Sign out
  signOut: async () => {
    return supabase.auth.signOut();
  },

  // Get current session
  getSession: async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch user profile from users table
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return data as User;
  },

  // Subscribe to auth changes
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  resetPassword: async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  }
};

// Database helpers
export const db = {
  // Users
  users: {
    create: async (userData: Partial<User>) => {
      return supabase.from('users').insert(userData).select().single();
    },
    update: async (id: string, updates: Partial<User>) => {
      return supabase.from('users').update(updates).eq('id', id).select().single();
    },
    getById: async (id: string) => {
      return supabase.from('users').select('*').eq('id', id).single();
    }
  },

  // Plant Species
  plantSpecies: {
    getById: async (id: string) => {
      return supabase.from('plant_species').select('*').eq('id', id).single();
    },
    getByScientificName: async (scientificName: string) => {
      return supabase.from('plant_species').select('*').eq('scientific_name', scientificName).single();
    },
    search: async (query: string, limit = 20) => {
      return supabase
        .from('plant_species')
        .select('*')
        .or(`common_name.ilike.%${query}%,scientific_name.ilike.%${query}%`)
        .limit(limit);
    },
    list: async (limit = 50, offset = 0) => {
      return supabase
        .from('plant_species')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('common_name');
    }
  },

  // User Plants
  userPlants: {
    create: async (plantData: Partial<UserPlant>) => {
      return supabase.from('user_plants').insert(plantData).select().single();
    },
    update: async (id: string, updates: Partial<UserPlant>) => {
      return supabase.from('user_plants').update(updates).eq('id', id).select().single();
    },
    delete: async (id: string) => {
      return supabase.from('user_plants').delete().eq('id', id);
    },
    getById: async (id: string) => {
      return supabase
        .from('user_plants')
        .select('*, species:plant_species(*)')
        .eq('id', id)
        .single();
    },
    listByUser: async (userId: string, filter?: string) => {
      let query = supabase
        .from('user_plants')
        .select('*, species:plant_species(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filter === 'indoor') {
        query = query.eq('location_type', 'indoor');
      } else if (filter === 'outdoor') {
        query = query.eq('location_type', 'outdoor');
      } else if (filter === 'needs_water') {
        query = query.eq('status', 'needs_attention');
      }

      return query;
    },
    getStats: async (userId: string) => {
      const { data } = await supabase
        .from('user_plants')
        .select('status, id', { count: 'exact' })
        .eq('user_id', userId);

      if (!data) return { total: 0, healthy: 0, needsAttention: 0 };

      const total = data.length;
      const healthy = data.filter(p => p.status === 'healthy').length;
      const needsAttention = data.filter(p => p.status === 'needs_attention').length;

      return { total, healthy, needsAttention };
    }
  },

  // Scan Records
  scanRecords: {
    create: async (scanData: Partial<ScanRecord>) => {
      return supabase.from('scan_records').insert(scanData).select().single();
    },
    getById: async (id: string) => {
      return supabase.from('scan_records').select('*').eq('id', id).single();
    },
    listByUser: async (userId: string, limit = 20) => {
      return supabase
        .from('scan_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    }
  },

  // Care Tasks
  careTasks: {
    create: async (taskData: Partial<CareTask>) => {
      return supabase.from('care_tasks').insert(taskData).select().single();
    },
    update: async (id: string, updates: Partial<CareTask>) => {
      return supabase.from('care_tasks').update(updates).eq('id', id).select().single();
    },
    complete: async (id: string) => {
      const now = new Date().toISOString();
      return supabase
        .from('care_tasks')
        .update({ status: 'completed', last_completed_at: now })
        .eq('id', id)
        .select()
        .single();
    },
    getById: async (id: string) => {
      return supabase
        .from('care_tasks')
        .select('*, user_plant:user_plants(*)')
        .eq('id', id)
        .single();
    },
    listByUser: async (userId: string, includeCompleted = false) => {
      let query = supabase
        .from('care_tasks')
        .select('*, user_plant:user_plants(*, species:plant_species(*))')
        .eq('user_plant.user_id', userId);

      if (!includeCompleted) {
        query = query.neq('status', 'completed');
      }

      return query.order('next_due_at', { ascending: true });
    },
    listToday: async (userId: string) => {
      const today = new Date().toISOString().split('T')[0];
      return supabase
        .from('care_tasks')
        .select('*, user_plant:user_plants(*, species:plant_species(*))')
        .eq('user_plant.user_id', userId)
        .lte('next_due_at', today)
        .neq('status', 'completed')
        .order('next_due_at');
    },
    generateForPlant: async (userPlantId: string, speciesCareProfile: CareProfile) => {
      const tasks: Partial<CareTask>[] = [];
      const now = new Date();

      // Water task
      const waterTask: Partial<CareTask> = {
        user_plant_id: userPlantId,
        task_type: 'water',
        next_due_at: new Date(now.getTime() + speciesCareProfile.water_frequency_days * 24 * 60 * 60 * 1000).toISOString(),
        frequency_days: speciesCareProfile.water_frequency_days,
        reminder_enabled: true,
        status: 'pending'
      };
      tasks.push(waterTask);

      // Fertilize task
      if (speciesCareProfile.fertilizer_frequency_days) {
        const fertilizeTask: Partial<CareTask> = {
          user_plant_id: userPlantId,
          task_type: 'fertilize',
          next_due_at: new Date(now.getTime() + speciesCareProfile.fertilizer_frequency_days * 24 * 60 * 60 * 1000).toISOString(),
          frequency_days: speciesCareProfile.fertilizer_frequency_days,
          reminder_enabled: true,
          status: 'pending'
        };
        tasks.push(fertilizeTask);
      }

      // Repot task
      if (speciesCareProfile.repotting_frequency_months) {
        const repotDate = new Date(now.getTime() + speciesCareProfile.repotting_frequency_months * 30 * 24 * 60 * 60 * 1000);
        const repotTask: Partial<CareTask> = {
          user_plant_id: userPlantId,
          task_type: 'repot',
          next_due_at: repotDate.toISOString(),
          reminder_enabled: true,
          status: 'pending'
        };
        tasks.push(repotTask);
      }

      return supabase.from('care_tasks').insert(tasks).select();
    }
  },

  // Reminder Config
  reminderConfigs: {
    getByUser: async (userId: string) => {
      return supabase.from('reminder_configs').select('*').eq('user_id', userId).single();
    },
    upsert: async (userId: string, config: Partial<ReminderConfig>) => {
      return supabase
        .from('reminder_configs')
        .upsert({ user_id: userId, ...config })
        .select()
        .single();
    }
  }
};

// Storage helpers
export const storage = {
  uploadImage: async (file: File, userId: string): Promise<string | null> => {
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('plant-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('plant-images')
      .getPublicUrl(data.path);

    return publicUrl;
  },

  getImageUrl: (path: string): string => {
    const { data: { publicUrl } } = supabase.storage
      .from('plant-images')
      .getPublicUrl(path);
    return publicUrl;
  }
};

// RLS (Row Level Security) check - helper for debugging
export const checkRLS = async (table: string, operation: 'select' | 'insert' | 'update' | 'delete') => {
  const { data, error } = await supabase.rpc(`check_${operation}_permission`, { table_name: table });
  if (error) {
    console.error('RLS check error:', error);
    return false;
  }
  return data as boolean;
};
