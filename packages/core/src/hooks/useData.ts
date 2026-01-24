import Taro from '@tarojs/taro';
import { useQuery } from '@tanstack/react-query';
import { captureError, addBreadcrumb } from '../services/monitoring';
import { ApiResponse } from '../types';

// Detect if running in H5 environment
const isH5 = typeof window !== 'undefined' && !Taro.getEnv;

// Fetch wrapper with error handling
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    addBreadcrumb('api', `Fetching ${url}`);

    // Use native fetch in H5 environment
    if (isH5 || typeof Taro.request !== 'function') {
      const response = await fetch(url, options);

      if (!response.ok) {
        // Check if response is HTML (404/500 page)
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          throw new Error(`API endpoint not found: ${url}`);
        }
        throw new Error(`API Error: ${response.status}`);
      }

      // Try to parse JSON, handle non-JSON responses
      try {
        const data = await response.json();
        return data as T;
      } catch (parseError) {
        console.warn('Response is not valid JSON:', url);
        throw new Error(`Invalid JSON response from ${url}`);
      }
    }

    // Use Taro.request in mini-program environment
    const response = await Taro.request<T>({
      url,
      method: (options?.method as any) || 'GET',
      data: options?.body,
      header: options?.headers as Record<string, string>,
    });

    if (response.statusCode >= 400) {
      throw new Error(`API Error: ${response.statusCode}`);
    }

    return response.data as T;
  } catch (error) {
    // Log error but don't spam console in development
    if (process.env.NODE_ENV !== 'development') {
      captureError(error as Error, { url, options });
    }
    throw error;
  }
}

// Query keys factory
export const queryKeys = {
  // Plants
  plants: (userId: string) => ['plants', { userId }] as const,
  plant: (id: string) => ['plants', id] as const,
  plantSearch: (query: string) => ['plants', 'search', query] as const,

  // Garden
  garden: (userId: string) => ['garden', { userId }] as const,
  gardenStats: (userId: string) => ['garden', 'stats', { userId }] as const,

  // Tasks
  tasks: (userId: string) => ['tasks', { userId }] as const,
  todayTasks: (userId: string) => ['tasks', 'today', { userId }] as const,
  task: (id: string) => ['tasks', id] as const,

  // User
  user: (userId: string) => ['user', userId] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,

  // Species
  species: ['species'] as const,
  speciesDetail: (id: string) => ['species', id] as const,
  recommendedPlant: ['species', 'recommended'] as const,

  // Search
  search: (query: string) => ['search', query] as const
};

// Custom hooks for common data fetching
export function usePlants(userId: string) {
  return useQuery({
    queryKey: queryKeys.plants(userId),
    queryFn: () => fetchWithErrorHandling<{success: boolean, data: any[]}>(`/api/db?table=user_plants&user_id=${userId}`),
    enabled: !!userId
  });
}

export function useGardenStats(userId: string) {
  return useQuery({
    queryKey: queryKeys.gardenStats(userId),
    queryFn: () => fetchWithErrorHandling<{success: boolean, data: any}>(`/api/tasks?user_id=${userId}&stats=true`),
    enabled: !!userId
  });
}

export function useTodayTasks(userId: string) {
  return useQuery({
    queryKey: queryKeys.todayTasks(userId),
    queryFn: () => fetchWithErrorHandling<{success: boolean, data: any[]}>(`/api/tasks?user_id=${userId}&today=true`),
    enabled: !!userId
  });
}

export function useRecommendedPlant() {
  return useQuery({
    queryKey: queryKeys.recommendedPlant,
    queryFn: () => fetchWithErrorHandling<{success: boolean, data: any}>(`/api/db?table=plant_species&limit=1`),
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => fetchWithErrorHandling<{success: boolean, data: any}>(`/api/db?table=users&id=${userId}`),
    enabled: !!userId
  });
}

export function usePlantSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => fetchWithErrorHandling<ApiResponse<any[]>>(`/api/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useSpeciesDetail(speciesId: string) {
  return useQuery({
    queryKey: queryKeys.speciesDetail(speciesId),
    queryFn: () => fetchWithErrorHandling<ApiResponse<any>>(`/api/db?table=plant_species&id=${speciesId}`),
    enabled: !!speciesId
  });
}

export function useScanResult(scanId: string) {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => fetchWithErrorHandling<ApiResponse<any>>(`/api/db?table=scan_records&id=${scanId}`),
    enabled: !!scanId
  });
}
