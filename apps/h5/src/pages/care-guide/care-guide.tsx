import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { CareTag, TaskCard } from '@plant-scanner/ui';
import './care-guide.scss';

interface CareProfile {
  light_requirement: string;
  water_frequency_days: number;
  temperature_min_c: number;
  temperature_max_c: number;
  soil_type: string;
  fertilizer_frequency_days: number;
  difficulty: string;
  expert_tips: string[];
  troubleshooting: Array<{
    problem: string;
    symptoms: string[];
    solutions: string[];
  }>;
}

interface PlantData {
  id: string;
  nickname: string;
  species_name: string;
  scientific_name: string;
  description: string;
  image_url: string;
  location_type: 'indoor' | 'outdoor';
  status: string;
  care_profile: CareProfile;
  tasks: Array<{
    id: string;
    type: 'water' | 'fertilize' | 'repot' | 'prune' | 'custom';
    plant_name: string;
    due_at: string;
    is_completed: boolean;
    is_overdue: boolean;
  }>;
}

const mockPlant: PlantData = {
  id: '1',
  nickname: '小绿',
  species_name: '龟背竹',
  scientific_name: 'Monstera deliciosa',
  description: '龟背竹是一种原产于热带美洲的观叶植物，以其独特的裂叶而闻名。它是非常受欢迎的室内观赏植物，能够净化空气，增加室内绿意。',
  image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600',
  location_type: 'indoor',
  status: 'healthy',
  care_profile: {
    light_requirement: 'partial_shade',
    water_frequency_days: 7,
    temperature_min_c: 15,
    temperature_max_c: 30,
    soil_type: '疏松透气、排水良好',
    fertilizer_frequency_days: 30,
    difficulty: 'easy',
    expert_tips: [
      '保持土壤微湿但不要积水',
      '避免阳光直射，防止叶片灼伤',
      '定期擦拭叶片，保持清洁',
      '春秋季节可适当施肥'
    ],
    troubleshooting: [
      {
        problem: '叶片发黄',
        symptoms: ['叶片整体变黄', '老叶先发黄'],
        solutions: ['减少浇水频率', '检查是否有积水', '确保排水良好']
      },
      {
        problem: '叶片边缘干枯',
        symptoms: ['叶片边缘变褐色', '干燥卷曲'],
        solutions: ['增加环境湿度', '避免空调直吹', '适当喷雾']
      },
      {
        problem: '生长缓慢',
        symptoms: ['新叶长出慢', '叶片变小'],
        solutions: ['检查光照是否充足', '适当施肥补充养分', '考虑换盆']
      }
    ]
  },
  tasks: [
    { id: 't1', type: 'water', plant_name: '小绿', due_at: new Date().toISOString(), is_completed: false, is_overdue: false },
    { id: 't2', type: 'fertilize', plant_name: '小绿', due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), is_completed: false, is_overdue: false }
  ]
};

export default function CareGuidePage() {
  const [plant] = useState<PlantData>(mockPlant);
  const [activeTab, setActiveTab] = useState<'care' | 'troubleshoot'>('care');

  const handleCompleteTask = (taskId: string) => {
    Taro.showToast({
      title: '任务完成！',
      icon: 'success'
    });
  };

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
    });
  };

  return (
    <View className="care-guide-page">
      <View className="care-guide__topbar">
        <View className="care-guide__back" onClick={() => Taro.navigateBack()}>
          <Text>←</Text>
        </View>
        <Text className="care-guide__title">养护指南</Text>
        <View className="care-guide__share" onClick={handleShare}>
          <Text>📤</Text>
        </View>
      </View>

      <View className="care-guide__header">
        <Image
          src={plant.image_url}
          mode="aspectFill"
          className="care-guide__image"
        />
        <View className="care-guide__gradient"></View>
        <View className="care-guide__plant-info">
          <Text className="care-guide__nickname">{plant.nickname}</Text>
          <Text className="care-guide__scientific">{plant.scientific_name}</Text>
        </View>
      </View>

      {/* Tab navigation */}
      <View className="care-guide__tabs">
        <View
          className={`care-guide__tab ${activeTab === 'care' ? 'care-guide__tab--active' : ''}`}
          onClick={() => setActiveTab('care')}
        >
          <Text>养护指南</Text>
        </View>
        <View
          className={`care-guide__tab ${activeTab === 'troubleshoot' ? 'care-guide__tab--active' : ''}`}
          onClick={() => setActiveTab('troubleshoot')}
        >
          <Text>问题排查</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="care-guide__content" scrollY>
        {activeTab === 'care' ? (
          <>
            {/* Care parameters */}
            <View className="care-guide__section">
              <Text className="care-guide__section-title">关键参数</Text>
              <View className="care-guide__params">
                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">☀️</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">光照</Text>
                    <CareTag type="light" value={plant.care_profile.light_requirement} size="md" />
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">💧</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">浇水</Text>
                    <Text className="care-guide__param-value">每 {plant.care_profile.water_frequency_days} 天</Text>
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">🌡️</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">温度</Text>
                    <Text className="care-guide__param-value">
                      {plant.care_profile.temperature_min_c}°C - {plant.care_profile.temperature_max_c}°C
                    </Text>
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">🪴</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">土壤</Text>
                    <Text className="care-guide__param-value">{plant.care_profile.soil_type}</Text>
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">🧪</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">施肥</Text>
                    <Text className="care-guide__param-value">
                      每 {plant.care_profile.fertilizer_frequency_days} 天
                    </Text>
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">🌱</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">难度</Text>
                    <CareTag type="difficulty" value={plant.care_profile.difficulty} size="md" />
                  </View>
                </View>
              </View>
            </View>

            {/* Expert tips */}
            <View className="care-guide__section">
              <Text className="care-guide__section-title">💡 专家建议</Text>
              {plant.care_profile.expert_tips.map((tip, index) => (
                <View key={index} className="care-guide__tip">
                  <Text className="care-guide__tip-number">{index + 1}</Text>
                  <Text className="care-guide__tip-text">{tip}</Text>
                </View>
              ))}
            </View>

            {/* Upcoming tasks */}
            <View className="care-guide__section">
              <Text className="care-guide__section-title">📋 待办任务</Text>
              {plant.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={{
                    ...task,
                    plant_name: task.plant_name,
                    is_completed: task.is_completed,
                    is_overdue: task.is_overdue
                  }}
                  onCheck={(checked) => checked && handleCompleteTask(task.id)}
                />
              ))}
              {plant.tasks.length === 0 && (
                <View className="care-guide__no-tasks">
                  <Text>暂无待办任务</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          /* Troubleshooting tab */
          <View className="care-guide__section">
            <Text className="care-guide__section-title">常见问题排查</Text>
            {plant.care_profile.troubleshooting.map((item, index) => (
              <View key={index} className="care-guide__troubleshoot">
                <View className="care-guide__troubleshoot-header">
                  <Text className="care-guide__troubleshoot-icon">⚠️</Text>
                  <Text className="care-guide__troubleshoot-problem">{item.problem}</Text>
                </View>

                <View className="care-guide__troubleshoot-section">
                  <Text className="care-guide__troubleshoot-label">表现症状</Text>
                  <View className="care-guide__troubleshoot-list">
                    {item.symptoms.map((symptom, i) => (
                      <Text key={i} className="care-guide__troubleshoot-item">• {symptom}</Text>
                    ))}
                  </View>
                </View>

                <View className="care-guide__troubleshoot-section">
                  <Text className="care-guide__troubleshoot-label">解决方法</Text>
                  <View className="care-guide__troubleshoot-list">
                    {item.solutions.map((solution, i) => (
                      <Text key={i} className="care-guide__troubleshoot-item care-guide__troubleshoot-item--solution">
                        ✓ {solution}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View className="care-guide__bottom">
        <Button className="care-guide__btn care-guide__btn--primary">
          编辑养护计划
        </Button>
      </View>
    </View>
  );
}
