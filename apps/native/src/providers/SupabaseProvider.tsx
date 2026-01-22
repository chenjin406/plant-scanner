import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Config from 'react-native-config';

interface SupabaseContextValue {
  client: SupabaseClient | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextValue>({
  client: null,
  isLoading: true
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabaseUrl = Config.SUPABASE_URL;
    const supabaseAnonKey = Config.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: require('@react-native-async-storage/async-storage').default,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      });
      setClient(supabase);
    }
    setIsLoading(false);
  }, []);

  return (
    <SupabaseContext.Provider value={{ client, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
