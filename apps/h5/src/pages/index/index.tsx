import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { SimpleBottomNav } from '@plant-scanner/ui';
import { useTodayTasks, useGardenStats, useRecommendedPlant, useUserProfile } from '@plant-scanner/core';
import './index.scss';

export default function Index() {
  // TODO: Get current user ID from auth store
  const userId = '00000000-0000-0000-0000-000000000001';
  
  const { data: userProfile } = useUserProfile(userId);
  const { data: stats } = useGardenStats(userId);
  const { data: tasksData } = useTodayTasks(userId);
  const { data: recommendedData } = useRecommendedPlant();

  const tasks = tasksData?.data || [];
  const recommendedPlant = recommendedData?.data?.[0];
  const gardenStats = stats?.data;

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

  const handleBottomNav = (key: string) => {
    if (key === 'scan') {
      Taro.navigateTo({ url: '/pages/camera/camera' });
      return;
    }

    const routes: Record<string, string> = {
      home: '/pages/index/index',
      garden: '/pages/garden/garden',
      search: '/pages/search/search',
      auth: '/pages/auth/auth'
    };

    const url = routes[key];
    if (url) {
      Taro.reLaunch({ url });
    }
  };

  return (
    <View className="home-page">
      <ScrollView className="home-page__content" scrollY>
        <View className="home-page__header">
          <View>
            <Text className="home-page__greeting">
              {userProfile?.data?.nickname ? `早安，${userProfile.data.nickname}` : '早安'}
            </Text>
            <View className="home-page__meta">
              <Text className="home-page__meta-dot">●</Text>
              <Text className="home-page__meta-text">22°C · 天气晴朗</Text>
            </View>
          </View>
          <View className="home-page__avatar">
            {userProfile?.data?.avatar_url ? (
              <Image className="home-page__avatar-img" src={userProfile.data.avatar_url} />
            ) : (
              <Text className="home-page__avatar-emoji">👤</Text>
            )}
          </View>
        </View>

        {gardenStats && gardenStats.needs_attention_count > 0 && (
          <View className="home-page__reminder">
            <View className="home-page__reminder-icon">
              <Text>💧</Text>
            </View>
            <View className="home-page__reminder-text">
              <Text className="home-page__reminder-title">浇水提醒</Text>
              <Text className="home-page__reminder-subtitle">
                今天有 {gardenStats.needs_attention_count} 株植物需要浇水
              </Text>
            </View>
            <Text className="home-page__reminder-arrow">›</Text>
          </View>
        )}

        <View className="home-page__section">
          <View className="home-page__section-header">
            <Text className="home-page__section-title">养护任务</Text>
            <Text className="home-page__section-link" onClick={() => handleNavigate('/pages/garden/garden')}>查看日程</Text>
          </View>
          <ScrollView className="home-page__tasks" scrollX>
            <View className="home-page__tasks-row">
              {tasks.length > 0 ? (
                tasks.map((task: any) => (
                  <View key={task.id} className="home-page__task-card">
                    <Image 
                      className="home-page__task-image" 
                      src={task.user_plant?.image_url || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400'} 
                      mode="aspectFill" 
                    />
                    <View className="home-page__task-icon">
                      <Text>{task.task_type === 'water' ? '💧' : '🌿'}</Text>
                    </View>
                    <Text className="home-page__task-name">{task.user_plant?.nickname || '植物'}</Text>
                    <Text className="home-page__task-time">
                      {task.status === 'overdue' ? '已逾期' : '今日待办'}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="home-page__tasks-empty">
                  <Text>今日暂无任务</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {recommendedPlant && (
          <View className="home-page__section">
            <Text className="home-page__section-title">每日推荐植物</Text>
            <View className="home-page__recommend">
              <Image
                className="home-page__recommend-image"
                src={recommendedPlant.image_urls?.[0] || "https://images.unsplash.com/photo-1498842812179-c81beecf902c?w=800"}
                mode="aspectFill"
              />
              <View className="home-page__recommend-overlay"></View>
              <View className="home-page__recommend-meta">
                <Text className="home-page__recommend-label">每日新发现</Text>
                <Text className="home-page__recommend-title">{recommendedPlant.common_name}</Text>
                <Text className="home-page__recommend-tag">{recommendedPlant.category}</Text>
              </View>
            </View>
            <View className="home-page__recommend-body">
              <Text className="home-page__recommend-quote">
                “{recommendedPlant.description}”
              </Text>
              <View className="home-page__recommend-footer">
                <Text className="home-page__recommend-family">学名：{recommendedPlant.scientific_name}</Text>
                <View className="home-page__recommend-button" onClick={() => handleNavigate(`/pages/care-guide/care-guide?species_id=${recommendedPlant.id}`)}>
                  <Text>了解更多</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className="home-page__tip">
          <Text className="home-page__tip-icon">💡</Text>
          <View>
            <Text className="home-page__tip-title">园艺小贴士</Text>
            <Text className="home-page__tip-text">在冬季，大多数热带室内植物的浇水频率应减少一半，以防止根部腐烂。</Text>
          </View>
        </View>

        <View className="home-page__spacer"></View>
      </ScrollView>

      <SimpleBottomNav
        activeKey="home"
        onChange={handleBottomNav}
        items={[
          { key: 'home', label: '首页', icon: '🏠' },
          { key: 'garden', label: '花园', icon: '🌿' },
          { key: 'scan', label: '识别', icon: '📷' },
          { key: 'search', label: '搜索', icon: '🔎' },
          { key: 'auth', label: '我的', icon: '👤' }
        ]}
      />
    </View>
  );
}
