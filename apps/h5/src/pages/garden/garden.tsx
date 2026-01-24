import Taro from '@tarojs/taro';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import { SimpleBottomNav } from '@plant-scanner/ui';
import { usePlants } from '@plant-scanner/core';
import './garden.scss';

type FilterType = 'all' | 'indoor' | 'outdoor' | 'needs_water';

export default function GardenPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // TODO: Get current user ID from auth store
  const userId = '00000000-0000-0000-0000-000000000001';
  const { data: plantsResponse, isLoading } = usePlants(userId);
  const plants = plantsResponse?.data || [];

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

  const filteredPlants = plants.filter((plant: any) => {
    // Apply filter
    if (filter === 'indoor' && plant.location_type !== 'indoor') return false;
    if (filter === 'outdoor' && plant.location_type !== 'outdoor') return false;
    if (filter === 'needs_water' && plant.status !== 'needs_attention') return false;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        plant.nickname.toLowerCase().includes(query) ||
        plant.species_name?.toLowerCase().includes(query) ||
        plant.species?.common_name?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const priorityPlants = plants.filter((p: any) => p.status === 'needs_attention');

  const handlePlantClick = (plantId: string) => {
    Taro.navigateTo({
      url: `/pages/care-guide/care-guide?plant_id=${plantId}`
    });
  };

  const handleAddPlant = () => {
    Taro.navigateTo({
      url: '/pages/camera/camera'
    });
  };

  if (isLoading) {
    return <View className="garden-page garden-page--loading">加载中...</View>;
  }

  return (
    <View className="garden-page">
      <ScrollView className="garden-page__content" scrollY>
        <View className="garden__topbar">
          <View className="garden__icon" />
          <Text className="garden__title">我的花园</Text>
          <View className="garden__avatar">👤</View>
        </View>

        <View className="garden__search-area">
          <View className="garden__search">
            <Text className="garden__search-icon">🔍</Text>
            <Input
              className="garden__search-input"
              placeholder="搜索我的植物"
              value={searchQuery}
              onInput={(e: any) => setSearchQuery(e.detail.value)}
            />
          </View>
        </View>

        <View className="garden__filters">
          {(['all', 'indoor', 'outdoor', 'needs_water'] as FilterType[]).map((f) => (
            <View
              key={f}
              className={`garden__filter ${filter === f ? 'garden__filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              <Text className="garden__filter-text">
                {f === 'all' ? '全部' : f === 'indoor' ? '室内' : f === 'outdoor' ? '室外' : '待浇水'}
              </Text>
            </View>
          ))}
        </View>

        {priorityPlants.length > 0 && filter === 'all' && (
          <View className="garden__priority">
            <View className="garden__priority-header">
              <View>
                <Text className="garden__priority-label">优先护理</Text>
                <Text className="garden__priority-title">{priorityPlants.length} 株植物待浇水</Text>
              </View>
              <View className="garden__priority-icon">💧</View>
            </View>
            <View className="garden__priority-avatars">
              {priorityPlants.slice(0, 3).map((plant: any) => (
                <Image
                  key={plant.id}
                  src={plant.image_url || ''}
                  mode="aspectFill"
                  className="garden__priority-avatar"
                />
              ))}
            </View>
          </View>
        )}

        <View className="garden__grid">
          {filteredPlants.map((plant: any) => (
            <View key={plant.id} className="garden__card" onClick={() => handlePlantClick(plant.id)}>
              <View className="garden__card-image">
                <Image src={plant.image_url || ''} mode="aspectFill" className="garden__card-photo" />
                {plant.status === 'needs_attention' && (
                  <View className="garden__card-badge">💧</View>
                )}
              </View>
              <View className="garden__card-body">
                <Text className="garden__card-name">{plant.nickname}</Text>
                <Text className="garden__card-species">{plant.species_name || plant.species?.common_name || ''}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="garden__spacer"></View>
      </ScrollView>
      <View className="garden__fab" onClick={handleAddPlant}>
        <Text className="garden__fab-icon">+</Text>
      </View>

      <SimpleBottomNav
        activeKey="garden"
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
