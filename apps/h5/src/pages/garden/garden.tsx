import Taro from '@tarojs/taro';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import './garden.scss';

type FilterType = 'all' | 'indoor' | 'outdoor' | 'needs_water';

interface Plant {
  id: string;
  nickname: string;
  species_name?: string;
  status: string;
  location_type: 'indoor' | 'outdoor';
  image_url?: string;
  next_task?: {
    type: string;
    due_at: string;
  };
}

const mockPlants: Plant[] = [
  {
    id: '1',
    nickname: '小绿',
    species_name: '龟背竹',
    status: 'healthy',
    location_type: 'indoor',
    image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=200',
    next_task: { type: 'water', due_at: '明天' }
  },
  {
    id: '2',
    nickname: '肉肉',
    species_name: '多肉植物',
    status: 'needs_attention',
    location_type: 'indoor',
    image_url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200',
    next_task: { type: 'water', due_at: '今天' }
  },
  {
    id: '3',
    nickname: '阳光',
    species_name: '绿萝',
    status: 'healthy',
    location_type: 'outdoor',
    image_url: 'https://images.unsplash.com/photo-1596724852267-1a8340e73258?w=200'
  }
];

export default function GardenPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [plants] = useState<Plant[]>(mockPlants);

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

  const filteredPlants = plants.filter(plant => {
    // Apply filter
    if (filter === 'indoor' && plant.location_type !== 'indoor') return false;
    if (filter === 'outdoor' && plant.location_type !== 'outdoor') return false;
    if (filter === 'needs_water' && plant.status !== 'needs_attention') return false;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        plant.nickname.toLowerCase().includes(query) ||
        plant.species_name?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const priorityPlants = plants.filter(p => p.status === 'needs_attention');

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

  return (
    <View className="garden-page">
      <ScrollView className="garden-page__content" scrollY>
        <View className="garden__topbar">
          <Text className="garden__icon">☰</Text>
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
              onInput={(e) => setSearchQuery(e.detail.value)}
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
              {priorityPlants.slice(0, 3).map((plant) => (
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
          {filteredPlants.map((plant) => (
            <View key={plant.id} className="garden__card" onClick={() => handlePlantClick(plant.id)}>
              <View className="garden__card-image">
                <Image src={plant.image_url || ''} mode="aspectFill" className="garden__card-photo" />
                {plant.status === 'needs_attention' && (
                  <View className="garden__card-badge">💧</View>
                )}
              </View>
              <View className="garden__card-body">
                <Text className="garden__card-name">{plant.nickname}</Text>
                <Text className="garden__card-species">{plant.species_name || ''}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="garden__spacer"></View>
      </ScrollView>

      <View className="garden__nav">
        <View className="garden__nav-item" onClick={() => handleNavigate('/pages/index/index')}>
          <Text className="garden__nav-icon">🏠</Text>
          <Text className="garden__nav-text">首页</Text>
        </View>
        <View className="garden__nav-item garden__nav-item--active">
          <Text className="garden__nav-icon">🌿</Text>
          <Text className="garden__nav-text">我的花园</Text>
        </View>
        <View className="garden__nav-gap"></View>
        <View className="garden__nav-item" onClick={() => handleNavigate()}>
          <Text className="garden__nav-icon">👥</Text>
          <Text className="garden__nav-text">社区</Text>
        </View>
        <View className="garden__nav-item" onClick={() => handleNavigate()}>
          <Text className="garden__nav-icon">⚙️</Text>
          <Text className="garden__nav-text">设置</Text>
        </View>
      </View>
      <View className="garden__fab" onClick={handleAddPlant}>
        <Text className="garden__fab-icon">+</Text>
      </View>
    </View>
  );
}
