import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useSupabase } from './SupabaseProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: string;
  nickname: string;
  avatar_url?: string;
  locale: string;
  timezone: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  userProfile: null,
  isLoading: true,
  signInWithPhone: async () => {},
  verifyOTP: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { client, isLoading: supabaseLoading } = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    // Fetch user profile
    AsyncStorage.getItem(`user_profile_${user.id}`).then((data) => {
      if (data) {
        setUserProfile(JSON.parse(data));
      }
    });
  }, [user]);

  const signInWithPhone = async (phone: string) => {
    if (!client) throw new Error('Supabase client not initialized');
    const { error } = await client.auth.signInWithOtp({ phone });
    if (error) throw error;
  };

  const verifyOTP = async (phone: string, otp: string) => {
    if (!client) throw new Error('Supabase client not initialized');
    const { data, error } = await client.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    if (error) throw error;
    setSession(data.session);
    setUser(data.session?.user ?? null);
  };

  const signOut = async () => {
    if (!client) return;
    await client.auth.signOut();
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userProfile,
        isLoading: isLoading || supabaseLoading,
        signInWithPhone,
        verifyOTP,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
