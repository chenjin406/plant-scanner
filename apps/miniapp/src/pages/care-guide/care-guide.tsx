import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import { useState } from 'react';
import './care-guide.scss';

export default function CareGuidePage() {
  const { plant_id } = this.$router.params;
  const [activeTab, setActiveTab] = useState<'care' | 'troubleshoot'>('care');

  // Mock data
  const plant = {
    id: plant_id,
    nickname: '小绿',
    species_name: '龟背竹',
    scientific_name: 'Monstera deliciosa',
    image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600',
    status: 'healthy',
    care_profile: {
      light_requirement: 'partial_shade',
      water_frequency_days: 7,
      temperature_min_c: 15,
      temperature_max_c: 30,
      soil_type: '疏松透气、排水良好',
      difficulty: 'easy',
      expert_tips: [
        '保持土壤微湿但不要积水',
        '避免阳光直射，防止叶片灼伤',
        '定期擦拭叶片，保持清洁'
      ],
      troubleshooting: [
        {
          problem: '叶片发黄',
          symptoms: ['叶片整体变黄'],
          solutions: ['减少浇水频率', '检查是否有积水']
        }
      ]
    },
    tasks: [
      { id: 't1', type: 'water', due_at: new Date().toISOString(), is_completed: false },
      { id: 't2', type: 'fertilize', due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), is_completed: false }
    ]
  };

  const handleCompleteTask = (taskId: string) => {
    Taro.showToast({ title: '任务完成！', icon: 'success' });
  };

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true });
  };

  return (
    <ScrollView className="care-guide-page" scrollY>
      {/* Header */}
      <View className="care-guide__header">
        <Image src={plant.image_url} mode="aspectFill" className="care-guide__image" />
        <View className="care-guide__back" onClick={() => Taro.navigateBack()}>
          <Text>← 返回</Text>
        </View>
        <View className="care-guide__share" onClick={handleShare}>
          <Text>📤</Text>
        </View>
        <View className="care-guide__gradient"></View>
        <View className="care-guide__plant-info">
          <Text className="care-guide__nickname">{plant.nickname}</Text>
          <Text className="care-guide__scientific">{plant.scientific_name}</Text>
        </View>
      </View>

      {/* Tab Navigation */}
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
      <View className="care-guide__content">
        {activeTab === 'care' ? (
          <>
            {/* Care Parameters */}
            <View className="care-guide__section">
              <Text className="care-guide__section-title">关键参数</Text>
              <View className="care-guide__params">
                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">☀️</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">光照</Text>
                    <Text className="care-guide__param-value">半阴</Text>
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
                    <Text className="care-guide__param-value">{plant.care_profile.temperature_min_c}-{plant.care_profile.temperature_max_c}°C</Text>
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
                  <Text className="care-guide__param-icon">🌱</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">难度</Text>
                    <Text className="care-guide__param-value">简单</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Expert Tips */}
            <View className="care-guide__section">
              <Text className="care-guide__section-title">💡 专家建议</Text>
              {plant.care_profile.expert_tips.map((tip, index) => (
                <View key={index} className="care-guide__tip">
                  <Text className="care-guide__tip-number">{index + 1}</Text>
                  <Text className="care-guide__tip-text">{tip}</Text>
                </View>
              ))}
            </View>

            {/* Tasks */}
            <View className="care-guide__section">
              <Text className="care-guide__section-title">📋 待办任务</Text>
              {plant.tasks.map(task => (
                <View key={task.id} className="care-guide__task">
                  <View className="care-guide__task-icon">
                    <Text>{task.type === 'water' ? '💧' : '🧪'}</Text>
                  </View>
                  <View className="care-guide__task-info">
                    <Text className="care-guide__task-plant">{plant.nickname}</Text>
                    <Text className="care-guide__task-type">
                      {task.type === 'water' ? '浇水' : task.type === 'fertilize' ? '施肥' : '护理'}
                    </Text>
                  </View>
                  <View className="care-guide__task-time">
                    <Text>{new Date(task.due_at).toLocaleDateString('zh-CN')}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          /* Troubleshooting */}
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
                  {item.symptoms.map((s, i) => (
                    <Text key={i} className="care-guide__troubleshoot-item">• {s}</Text>
                  ))}
                </View>
                <View className="care-guide__troubleshoot-section">
                  <Text className="care-guide__troubleshoot-label">解决方法</Text>
                  {item.solutions.map((s, i) => (
                    <Text key={i} className="care-guide__troubleshoot-item care-guide__troubleshoot-item--solution">✓ {s}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Button */}
      <View className="care-guide__bottom">
        <Button className="care-guide__btn">编辑养护计划</Button>
      </View>
    </ScrollView>
  );
}

CareGuidePage.config = definePageConfig({
  navigationBarTitleText: '养护指南'
});
