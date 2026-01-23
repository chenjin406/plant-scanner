import Taro, { definePageConfig } from '@tarojs/taro';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import './index.scss';

export default function Index() {
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

  const tasks = [
    {
      id: '1',
      name: '龟背竹',
      time: '2小时后浇水',
      icon: '💧',
      image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400'
    },
    {
      id: '2',
      name: '虎尾兰',
      time: '今日施肥',
      icon: '🌿',
      image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400'
    },
    {
      id: '3',
      name: '琴叶榕',
      time: '浇水已逾期',
      icon: '💧',
      image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400'
    }
  ];

  return (
    <View className="home-page">
      <ScrollView className="home-page__content" scrollY>
        <View className="home-page__header">
          <View>
            <Text className="home-page__greeting">早安，埃利亚斯</Text>
            <View className="home-page__meta">
              <Text className="home-page__meta-dot">●</Text>
              <Text className="home-page__meta-text">22°C · 天气晴朗</Text>
            </View>
          </View>
          <View className="home-page__avatar">
            <Text className="home-page__avatar-emoji">👤</Text>
          </View>
        </View>

        <View className="home-page__reminder">
          <View className="home-page__reminder-icon">
            <Text>💧</Text>
          </View>
          <View className="home-page__reminder-text">
            <Text className="home-page__reminder-title">浇水提醒</Text>
            <Text className="home-page__reminder-subtitle">今天有 3 株植物需要浇水</Text>
          </View>
          <Text className="home-page__reminder-arrow">›</Text>
        </View>

        <View className="home-page__section">
          <View className="home-page__section-header">
            <Text className="home-page__section-title">养护任务</Text>
            <Text className="home-page__section-link">查看日程</Text>
          </View>
          <ScrollView className="home-page__tasks" scrollX>
            <View className="home-page__tasks-row">
              {tasks.map((task) => (
                <View key={task.id} className="home-page__task-card">
                  <Image className="home-page__task-image" src={task.image} mode="aspectFill" />
                  <View className="home-page__task-icon">
                    <Text>{task.icon}</Text>
                  </View>
                  <Text className="home-page__task-name">{task.name}</Text>
                  <Text className="home-page__task-time">{task.time}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="home-page__section">
          <Text className="home-page__section-title">每日推荐植物</Text>
          <View className="home-page__recommend">
            <Image
              className="home-page__recommend-image"
              src="https://images.unsplash.com/photo-1498842812179-c81beecf902c?w=800"
              mode="aspectFill"
            />
            <View className="home-page__recommend-overlay"></View>
            <View className="home-page__recommend-meta">
              <Text className="home-page__recommend-label">每日新发现</Text>
              <Text className="home-page__recommend-title">花叶黄金葛</Text>
              <Text className="home-page__recommend-tag">容易养护</Text>
            </View>
          </View>
          <View className="home-page__recommend-body">
            <Text className="home-page__recommend-quote">
              “‘N' Joy’ 绿萝以其迷人的白色斑块和紧凑的生长习性而闻名。它是书架等低光照环境的完美选择。”
            </Text>
            <View className="home-page__recommend-footer">
              <Text className="home-page__recommend-family">科属：天南星科</Text>
              <View className="home-page__recommend-button">
                <Text>了解更多</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="home-page__tip">
          <Text className="home-page__tip-icon">💡</Text>
          <View>
            <Text className="home-page__tip-title">园艺小贴士</Text>
            <Text className="home-page__tip-text">在冬季，大多数热带室内植物的浇水频率应减少一半，以防止根部腐烂。</Text>
          </View>
        </View>

        <View className="home-page__spacer"></View>
      </ScrollView>

      <View className="home-page__nav">
        <View className="home-page__nav-item home-page__nav-item--active">
          <Text className="home-page__nav-icon">🏠</Text>
          <Text className="home-page__nav-text">首页</Text>
        </View>
        <View
          className="home-page__nav-item"
          onClick={() => handleNavigate('/pages/garden/garden')}
        >
          <Text className="home-page__nav-icon">🌿</Text>
          <Text className="home-page__nav-text">我的花园</Text>
        </View>
        <View className="home-page__nav-gap"></View>
        <View className="home-page__nav-item" onClick={() => handleNavigate()}>
          <Text className="home-page__nav-icon">👥</Text>
          <Text className="home-page__nav-text">社区</Text>
        </View>
        <View className="home-page__nav-item" onClick={() => handleNavigate()}>
          <Text className="home-page__nav-icon">⚙️</Text>
          <Text className="home-page__nav-text">设置</Text>
        </View>
      </View>
      <View className="home-page__fab" onClick={() => handleNavigate('/pages/camera/camera')}>
        <Text className="home-page__fab-icon">📷</Text>
      </View>
    </View>
  );
}

Index.config = definePageConfig({
  navigationBarTitleText: '首页'
});
