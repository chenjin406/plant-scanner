// Plant Species Model
export interface PlantSpecies {
  id: string;
  common_name: string;
  scientific_name: string;
  category: string;
  description: string;
  image_urls: string[];
  tags: string[];
  care_profile: CareProfile;
  created_at: string;
  updated_at: string;
}

// Care Profile for a plant species
export interface CareProfile {
  light_requirement: 'full_sun' | 'partial_sun' | 'partial_shade' | 'full_shade';
  water_frequency_days: number;
  temperature_min_c: number;
  temperature_max_c: number;
  soil_type: string;
  fertilizer_frequency_days: number;
  repotting_frequency_months: number;
  difficulty: 'easy' | 'medium' | 'hard';
  toxicity: string[];
  expert_tips: string[];
  troubleshooting: TroubleshootingItem[];
}

// Troubleshooting item
export interface TroubleshootingItem {
  problem: string;
  symptoms: string[];
  solutions: string[];
}

// User Model
export interface User {
  id: string;
  nickname: string;
  avatar_url?: string;
  locale: string;
  timezone: string;
  auth_provider: 'phone' | 'wechat' | 'apple' | 'google';
  auth_provider_id?: string;
  created_at: string;
  updated_at: string;
}

// User's Plant (instance in their garden)
export interface UserPlant {
  id: string;
  user_id: string;
  species_id: string;
  nickname: string;
  location_type: 'indoor' | 'outdoor';
  status: 'healthy' | 'needs_attention' | 'dying';
  notes?: string;
  image_url?: string;
  last_action_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  species?: PlantSpecies;
}

// Scan Record
export interface ScanRecord {
  id: string;
  user_id: string;
  image_url: string;
  result_species_id?: string;
  result_species_name?: string;
  confidence: number;
  suggested_species?: SuggestedSpecies[];
  created_at: string;
}

// Suggested species from recognition
export interface SuggestedSpecies {
  species_id: string;
  common_name: string;
  scientific_name: string;
  confidence: number;
}

// Care Task
export interface CareTask {
  id: string;
  user_plant_id: string;
  task_type: 'water' | 'fertilize' | 'repot' | 'prune' | 'custom';
  custom_name?: string;
  next_due_at: string;
  last_completed_at?: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  frequency_days?: number;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_plant?: UserPlant;
}

// Reminder Configuration
export interface ReminderConfig {
  id: string;
  user_id: string;
  push_enabled: boolean;
  mini_program_subscription: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

// Weather data for garden
export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  condition: string;
  icon: string;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Identification result
export interface IdentificationResult {
  scan_id: string;
  top_suggestion: SuggestedSpecies;
  all_suggestions: SuggestedSpecies[];
  care_profile?: CareProfile;
  description?: string;
  image_url?: string;
  confidence?: number;
  threshold_met?: boolean;
}

// Garden statistics
export interface GardenStats {
  total_plants: number;
  healthy_count: number;
  needs_attention_count: number;
  today_tasks: number;
  pending_tasks: number;
  completed_today: number;
}

// Filter options for garden
export type GardenFilter = 'all' | 'indoor' | 'outdoor' | 'needs_water' | 'healthy';

// Location type
export type LocationType = 'indoor' | 'outdoor';
