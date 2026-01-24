import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { CareTag, TaskCard } from '@plant-scanner/ui';
import { usePlants, useSpeciesDetail } from '@plant-scanner/core';
import './care-guide.scss';

export default function CareGuidePage() {
  const { plant_id, species_id } = Taro.getCurrentInstance().router?.params || {};
  const [activeTab, setActiveTab] = useState<'care' | 'troubleshoot'>('care');
  
  // TODO: Get current user ID from auth store
  const userId = '00000000-0000-0000-0000-000000000001';
  const { data: plantsResponse } = usePlants(userId);
  const userPlant = plantsResponse?.data?.find((p: any) => p.id === plant_id);
  
  const targetSpeciesId = species_id || userPlant?.species_id;
  const { data: speciesResponse, isLoading } = useSpeciesDetail(targetSpeciesId);
  const species = speciesResponse?.data;

  const handleNavigate = (url?: string) => {
    if (url) {
      Taro.navigateTo({ url });
      return;
    }

    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

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

  if (isLoading) {
    return <View className="care-guide-page--loading">加载中...</View>;
  }

  if (!species && !userPlant) {
    return <View className="care-guide-page--error">未找到植物信息</View>;
  }

  const careProfile = species?.care_profile || userPlant?.species?.care_profile || {};
  const tasks = userPlant?.tasks || [];

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
          src={userPlant?.image_url || species?.image_urls?.[0] || ''}
          mode="aspectFill"
          className="care-guide__image"
        />
        <View className="care-guide__gradient"></View>
        <View className="care-guide__plant-info">
          <Text className="care-guide__nickname">{userPlant?.nickname || species?.common_name}</Text>
          <Text className="care-guide__scientific">{species?.scientific_name}</Text>
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
                    <CareTag type="light" value={careProfile.light_requirement} size="md" />
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">💧</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">浇水</Text>
                    <Text className="care-guide__param-value">每 {careProfile.water_frequency_days} 天</Text>
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">🌡️</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">温度</Text>
                    <Text className="care-guide__param-value">
                      {careProfile.temperature_min_c}°C - {careProfile.temperature_max_c}°C
                    </Text>
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">🪴</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">土壤</Text>
                    <Text className="care-guide__param-value">{careProfile.soil_type}</Text>
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">🧪</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">施肥</Text>
                    <Text className="care-guide__param-value">
                      每 {careProfile.fertilizer_frequency_days} 天
                    </Text>
                  </View>
                </View>

                <View className="care-guide__param">
                  <Text className="care-guide__param-icon">🌱</Text>
                  <View className="care-guide__param-info">
                    <Text className="care-guide__param-label">难度</Text>
                    <CareTag type="difficulty" value={careProfile.difficulty} size="md" />
                  </View>
                </View>
              </View>
            </View>

            {/* Expert tips */}
            <View className="care-guide__section">
              <Text className="care-guide__section-title">💡 专家建议</Text>
              {(careProfile.expert_tips || []).map((tip: string, index: number) => (
                <View key={index} className="care-guide__tip">
                  <Text className="care-guide__tip-number">{index + 1}</Text>
                  <Text className="care-guide__tip-text">{tip}</Text>
                </View>
              ))}
            </View>

            {/* Upcoming tasks */}
            <View className="care-guide__section">
              <Text className="care-guide__section-title">📋 待办任务</Text>
              {tasks.map((task: any) => (
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
              {tasks.length === 0 && (
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
            {(careProfile.troubleshooting || []).map((item: any, index: number) => (
              <View key={index} className="care-guide__troubleshoot">
                <View className="care-guide__troubleshoot-header">
                  <Text className="care-guide__troubleshoot-icon">⚠️</Text>
                  <Text className="care-guide__troubleshoot-problem">{item.problem}</Text>
                </View>

                <View className="care-guide__troubleshoot-section">
                  <Text className="care-guide__troubleshoot-label">表现症状</Text>
                  <View className="care-guide__troubleshoot-list">
                    {(item.symptoms || []).map((symptom: string, i: number) => (
                      <Text key={i} className="care-guide__troubleshoot-item">• {symptom}</Text>
                    ))}
                  </View>
                </View>

                <View className="care-guide__troubleshoot-section">
                  <Text className="care-guide__troubleshoot-label">解决方法</Text>
                  <View className="care-guide__troubleshoot-list">
                    {(item.solutions || []).map((solution: string, i: number) => (
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
        <Button
          className="care-guide__btn care-guide__btn--primary"
          onClick={() => handleNavigate()}
        >
          编辑养护计划
        </Button>
      </View>
    </View>
  );
}
