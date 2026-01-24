import Taro from '@tarojs/taro';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import { usePlants } from '@plant-scanner/core';
import './garden.scss';

type FilterType = 'all' | 'indoor' | 'outdoor' | 'needs_water';

export default function GardenPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userId = '00000000-0000-0000-0000-000000000001'; // TODO: Get from auth store
  const { data: plantsResponse, isLoading } = usePlants(userId);
  const plants = plantsResponse?.data || [];

  const filteredPlants = plants.filter((plant: any) => {
    if (filter === 'indoor' && plant.location_type !== 'indoor') return false;
    if (filter === 'outdoor' && plant.location_type !== 'outdoor') return false;
    if (filter === 'needs_water' && plant.status !== 'needs_attention') return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return plant.nickname.toLowerCase().includes(query) || plant.species?.common_name?.toLowerCase().includes(query);
    }
    return true;
  });

  const priorityPlants = plants.filter((p: any) => p.status === 'needs_attention');

  const handlePlantClick = (plantId: string) => {
    Taro.navigateTo({
      url: `/pages/care-guide/index?plant_id=${plantId}`
    });
  };

  const handleAddPlant = () => {
    Taro.switchTab({ url: '/pages/camera/index' });
  };

  const statusColors: Record<string, string> = {
    healthy: '#4CAF50',
    needs_attention: '#FF9800',
    dying: '#F44336'
  };

  const statusTexts: Record<string, string> = {
    healthy: '健康',
    needs_attention: '需关注',
    dying: '状态不佳'
  };

  return (
    <View className="garden-page">
      {/* Header */}
      <View className="garden__header">
        <Text className="garden__title">我的花园</Text>
        <Text className="garden__subtitle">{mockPlants.length} 株植物</Text>
      </View>

      {/* Search and Filter */}
      <View className="garden__search-area">
        <View className="garden__search">
          <Text className="garden__search-icon">🔍</Text>
          <Input
            className="garden__search-input"
            placeholder="搜索植物..."
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
          />
        </View>

        <ScrollView className="garden__filters" scrollX>
          {(['all', 'indoor', 'outdoor', 'needs_water'] as FilterType[]).map(f => (
            <View
              key={f}
              className={`garden__filter ${filter === f ? 'garden__filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              <Text className="garden__filter-text">
                {f === 'all' ? '全部' : f === 'indoor' ? '室内' : f === 'outdoor' ? '室外' : '需浇水'}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Priority Section */}
      {priorityPlants.length > 0 && filter === 'all' && (
        <View className="garden__priority">
          <View className="garden__priority-header">
            <Text className="garden__priority-title">🔔 优先护理</Text>
            <Text className="garden__priority-count">{priorityPlants.length}株需要关注</Text>
          </View>
          <ScrollView className="garden__priority-list" scrollX>
            {priorityPlants.map(plant => (
              <View key={plant.id} className="garden__priority-plant" onClick={() => handlePlantClick(plant.id)}>
                <Image src={plant.image_url || ''} mode="aspectFill" className="garden__priority-thumb" />
                <View className="garden__priority-info">
                  <Text className="garden__priority-name">{plant.nickname}</Text>
                  <Text className="garden__priority-task">需要护理</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Plant Grid */}
      <ScrollView className="garden__plants" scrollY>
        {filteredPlants.length > 0 ? (
          <View className="garden__plant-grid">
            {filteredPlants.map(plant => (
              <View key={plant.id} className="garden__plant-card" onClick={() => handlePlantClick(plant.id)}>
                <Image src={plant.image_url || ''} mode="aspectFill" className="garden__plant-image" />
                <View className="garden__plant-badge" style={{ backgroundColor: statusColors[plant.status] }}>
                  <Text className="garden__plant-badge-text">{statusTexts[plant.status]}</Text>
                </View>
                <View className="garden__plant-info">
                  <Text className="garden__plant-name">{plant.nickname}</Text>
                  <Text className="garden__plant-species">{plant.species_name}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="garden__empty">
            <Text className="garden__empty-icon">🌱</Text>
            <Text className="garden__empty-text">还没有植物</Text>
            <View className="garden__empty-btn" onClick={handleAddPlant}>
              <Text>添加植物</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <View className="garden__fab" onClick={handleAddPlant}>
        <Text className="garden__fab-icon">+</Text>
      </View>

      {/* Bottom Nav */}
      <View className="garden__nav">
        <View className="garden__nav-item">
          <Text className="garden__nav-icon">🏠</Text>
        </View>
        <View className="garden__nav-item">
          <Text className="garden__nav-icon">📷</Text>
        </View>
        <View className="garden__nav-item garden__nav-item--active">
          <Text className="garden__nav-icon">🌿</Text>
        </View>
        <View className="garden__nav-item">
          <Text className="garden__nav-icon">📖</Text>
        </View>
      </View>
    </View>
  );
}

GardenPage.config = definePageConfig({
  navigationBarTitleText: '我的花园'
});
