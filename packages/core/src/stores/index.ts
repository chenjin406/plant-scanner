import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserPlant, CareTask, GardenFilter, WeatherData } from '../types';
import { auth, db } from '../services/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (phone: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface GardenState {
  plants: UserPlant[];
  selectedPlant: UserPlant | null;
  filter: GardenFilter;
  isLoading: boolean;
  setPlants: (plants: UserPlant[]) => void;
  addPlant: (plant: UserPlant) => void;
  updatePlant: (id: string, updates: Partial<UserPlant>) => void;
  removePlant: (id: string) => void;
  setSelectedPlant: (plant: UserPlant | null) => void;
  setFilter: (filter: GardenFilter) => void;
  setLoading: (loading: boolean) => void;
}

interface TaskState {
  tasks: CareTask[];
  todayTasks: CareTask[];
  isLoading: boolean;
  setTasks: (tasks: CareTask[]) => void;
  setTodayTasks: (tasks: CareTask[]) => void;
  addTask: (task: CareTask) => void;
  completeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<CareTask>) => void;
  setLoading: (loading: boolean) => void;
}

interface AppState {
  weather: WeatherData | null;
  theme: 'light' | 'dark' | 'system';
  locale: string;
  setWeather: (weather: WeatherData | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: string) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      signIn: async (phone: string, password?: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await auth.signInWithPhone(phone, password);
          if (error) throw error;
          if (data.user) {
            // Fetch or create user profile
            const { data: userData } = await db.users.getById(data.user.id);
            if (!userData) {
              // Create new user profile
              await db.users.create({
                id: data.user.id,
                nickname: `用户${phone.slice(-4)}`,
                locale: 'zh-CN',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                auth_provider: 'phone',
                auth_provider_id: phone
              });
            }
            set({ user: userData || null, session: data.session, isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      signOut: async () => {
        await auth.signOut();
        set({ user: null, session: null });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
);

// Garden Store
export const useGardenStore = create<GardenState>()((set, get) => ({
  plants: [],
  selectedPlant: null,
  filter: 'all',
  isLoading: false,
  setPlants: (plants) => set({ plants }),
  addPlant: (plant) => set((state) => ({ plants: [plant, ...state.plants] })),
  updatePlant: (id, updates) =>
    set((state) => ({
      plants: state.plants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
    })),
  removePlant: (id) =>
    set((state) => ({
      plants: state.plants.filter((p) => p.id !== id)
    })),
  setSelectedPlant: (selectedPlant) => set({ selectedPlant }),
  setFilter: (filter) => set({ filter }),
  setLoading: (isLoading) => set({ isLoading }),
  getFilteredPlants: () => {
    const { plants, filter } = get();
    switch (filter) {
      case 'indoor':
        return plants.filter((p) => p.location_type === 'indoor');
      case 'outdoor':
        return plants.filter((p) => p.location_type === 'outdoor');
      case 'needs_water':
        return plants.filter((p) => p.status === 'needs_attention');
      default:
        return plants;
    }
  }
}));

// Task Store
export const useTaskStore = create<TaskState>()((set) => ({
  tasks: [],
  todayTasks: [],
  isLoading: false,
  setTasks: (tasks) => set({ tasks }),
  setTodayTasks: (todayTasks) => set({ todayTasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: 'completed', last_completed_at: new Date().toISOString() } : t
      ),
      todayTasks: state.todayTasks.filter((t) => t.id !== id)
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      )
    })),
  setLoading: (isLoading) => set({ isLoading })
}));

// App Store
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      weather: null,
      theme: 'system',
      locale: 'zh-CN',
      setWeather: (weather) => set({ weather }),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale })
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale
      })
    }
  )
);
