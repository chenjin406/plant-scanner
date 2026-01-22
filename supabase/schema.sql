-- Plant Scanner Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  locale VARCHAR(10) DEFAULT 'zh-CN',
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
  auth_provider VARCHAR(20) DEFAULT 'phone',
  auth_provider_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_auth_provider_id ON users(auth_provider_id);

-- Plant species database
CREATE TABLE IF NOT EXISTS plant_species (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  common_name VARCHAR(200) NOT NULL,
  scientific_name VARCHAR(200) NOT NULL UNIQUE,
  category VARCHAR(50),
  description TEXT,
  image_urls TEXT[],
  tags TEXT[],
  care_profile JSONB NOT NULL DEFAULT '{}',
  source VARCHAR(50),
  external_id VARCHAR(100),
  license VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plant_species_common_name ON plant_species(common_name);
CREATE INDEX IF NOT EXISTS idx_plant_species_category ON plant_species(category);

-- User's plants (instances)
CREATE TABLE IF NOT EXISTS user_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  species_id UUID,
  nickname VARCHAR(100) NOT NULL,
  location_type VARCHAR(20) DEFAULT 'indoor',
  status VARCHAR(20) DEFAULT 'healthy',
  notes TEXT,
  image_url VARCHAR(500),
  last_action_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_plants_user_id ON user_plants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plants_species_id ON user_plants(species_id);
CREATE INDEX IF NOT EXISTS idx_user_plants_status ON user_plants(status);

-- Scan records
CREATE TABLE IF NOT EXISTS scan_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  result_species_id UUID,
  result_species_name VARCHAR(200),
  confidence DECIMAL(4,3),
  suggested_species JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_records_user_id ON scan_records(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_created_at ON scan_records(created_at);

-- Care tasks
CREATE TABLE IF NOT EXISTS care_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_plant_id UUID NOT NULL,
  task_type VARCHAR(20) NOT NULL,
  custom_name VARCHAR(100),
  next_due_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending',
  frequency_days INT,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_tasks_user_plant_id ON care_tasks(user_plant_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_next_due_at ON care_tasks(next_due_at);
CREATE INDEX IF NOT EXISTS idx_care_tasks_status ON care_tasks(status);

-- Reminder configurations
CREATE TABLE IF NOT EXISTS reminder_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  mini_program_subscription BOOLEAN DEFAULT FALSE,
  quiet_hours_start VARCHAR(10),
  quiet_hours_end VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('plant-images', 'plant-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_configs ENABLE ROW LEVEL SECURITY;

-- Users: Users can only access their own data
CREATE POLICY "Users can CRUD own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Plant species: Public read access
CREATE POLICY "Anyone can read plant species" ON plant_species
  FOR SELECT USING (true);

-- User plants: Users can CRUD their own plants
CREATE POLICY "Users can CRUD own plants" ON user_plants
  FOR ALL USING (user_id = auth.uid());

-- Scan records: Users can CRUD their own scan records
CREATE POLICY "Users can CRUD own scans" ON scan_records
  FOR ALL USING (user_id = auth.uid());

-- Care tasks: Users can CRUD their own tasks
CREATE POLICY "Users can CRUD own tasks" ON care_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_plants
      WHERE user_plants.id = care_tasks.user_plant_id
      AND user_plants.user_id = auth.uid()
    )
  );

-- Reminder configs: Users can CRUD their own config
CREATE POLICY "Users can CRUD own reminder config" ON reminder_configs
  FOR ALL USING (user_id = auth.uid());

-- Storage policies
CREATE POLICY "Users can upload plant images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'plant-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own plant images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'plant-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plant_species_updated_at BEFORE UPDATE ON plant_species
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_plants_updated_at BEFORE UPDATE ON user_plants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_tasks_updated_at BEFORE UPDATE ON care_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_configs_updated_at BEFORE UPDATE ON reminder_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Example data: Insert some common plants
INSERT INTO plant_species (common_name, scientific_name, category, description, care_profile, source, tags)
VALUES
  (
    '龟背竹',
    'Monstera deliciosa',
    '观叶植物',
    '龟背竹是一种原产于热带美洲的观叶植物，以其独特的裂叶而闻名。',
    '{
      "light_requirement": "partial_shade",
      "water_frequency_days": 7,
      "temperature_min_c": 15,
      "temperature_max_c": 30,
      "soil_type": "疏松透气、排水良好",
      "fertilizer_frequency_days": 30,
      "repotting_frequency_months": 12,
      "difficulty": "easy",
      "toxicity": ["有毒"],
      "expert_tips": ["保持土壤微湿但不要积水", "避免阳光直射"],
      "troubleshooting": [
        {
          "problem": "叶片发黄",
          "symptoms": ["叶片整体变黄", "老叶先发黄"],
          "solutions": ["减少浇水频率", "检查是否有积水"]
        }
      ]
    }'::jsonb,
    'manual',
    ARRAY['观叶', '网红植物', 'INS风']
  ),
  (
    '绿萝',
    'Epipremnum aureum',
    '观叶植物',
    '绿萝是最常见的室内绿植之一，适应性强，易于养护。',
    '{
      "light_requirement": "partial_shade",
      "water_frequency_days": 5,
      "temperature_min_c": 12,
      "temperature_max_c": 28,
      "soil_type": "通用营养土",
      "fertilizer_frequency_days": 30,
      "repotting_frequency_months": 18,
      "difficulty": "easy",
      "toxicity": ["有毒"],
      "expert_tips": ["可水培可土培", "喜欢湿润环境"],
      "troubleshooting": [
        {
          "problem": "叶片边缘干枯",
          "symptoms": ["叶片边缘变褐色", "干燥卷曲"],
          "solutions": ["增加环境湿度", "避免阳光直射"]
        }
      ]
    }'::jsonb,
    'manual',
    ARRAY['观叶', '净化空气', '易养护']
  ),
  (
    '多肉植物',
    'Succulent',
    '多肉植物',
    '多肉植物是一类肉质植物的总称，种类繁多，形态各异。',
    '{
      "light_requirement": "full_sun",
      "water_frequency_days": 10,
      "temperature_min_c": 5,
      "temperature_max_c": 35,
      "soil_type": "颗粒土、透气性好",
      "fertilizer_frequency_days": 60,
      "repotting_frequency_months": 24,
      "difficulty": "easy",
      "toxicity": ["部分有毒"],
      "expert_tips": ["宁干勿湿", "需要充足光照"],
      "troubleshooting": [
        {
          "problem": "徒长",
          "symptoms": ["茎节变长", "叶片稀疏"],
          "solutions": ["增加光照", "减少浇水"]
        }
      ]
    }'::jsonb,
    'manual',
    ARRAY['多肉', '耐旱', '观叶']
  );
