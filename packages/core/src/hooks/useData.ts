import Taro from '@tarojs/taro';
import { useQuery } from '@tanstack/react-query';
import { captureError, addBreadcrumb } from '@plant-scanner/core';

// Fetch wrapper with error handling
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    addBreadcrumb('api', `Fetching ${url}`);

    const response = await Taro.request<T>({
      url,
      ...options
    });

    if (response.statusCode >= 400) {
      throw new Error(`API Error: ${response.statusCode}`);
    }

    return response.data as T;
  } catch (error) {
    captureError(error as Error, { url, options });
    throw error;
  }
}

// Query keys factory
export const queryKeys = {
  // Plants
  plants: ['plants'] as const,
  plant: (id: string) => ['plants', id] as const,
  plantSearch: (query: string) => ['plants', 'search', query] as const,

  // Garden
  garden: ['garden'] as const,
  gardenStats: ['garden', 'stats'] as const,

  // Tasks
  tasks: ['tasks'] as const,
  todayTasks: ['tasks', 'today'] as const,
  task: (id: string) => ['tasks', id] as const,

  // User
  user: ['user'] as const,
  userProfile: ['user', 'profile'] as const,

  // Species
  species: ['species'] as const,
  speciesDetail: (id: string) => ['species', id] as const,

  // Search
  search: (query: string) => ['search', query] as const
};

// Custom hooks for common data fetching
export function usePlants(userId: string) {
  return useQuery({
    queryKey: queryKeys.plants,
    queryFn: () => fetchWithErrorHandling(`/api/db?table=user_plants&user_id=${userId}`),
    enabled: !!userId
  });
}

export function useTodayTasks(userId: string) {
  return useQuery({
    queryKey: queryKeys.todayTasks,
    queryFn: () => fetchWithErrorHandling(`/api/tasks?user_id=${userId}&today=true`),
    enabled: !!userId
  });
}

export function usePlantSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => fetchWithErrorHandling(`/api/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useGardenStats(userId: string) {
  return useQuery({
    queryKey: queryKeys.gardenStats,
    queryFn: () => fetchWithErrorHandling(`/api/db?table=user_plants&user_id=${userId}&stats=true`),
    enabled: !!userId
  });
}
