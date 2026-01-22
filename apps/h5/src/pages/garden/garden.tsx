import Taro from '@tarojs/taro';
import { View, Text, Image, Input } from '@tarojs/components';
import { useState } from 'react';
import { PlantCard, SimpleBottomNav, EmptyState, GardenEmptyState } from '@plant-scanner/ui';
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

  const navItems = [
    { key: 'home', label: '首页', icon: '🏠' },
    { key: 'camera', label: '识别', icon: '📷' },
    { key: 'garden', label: '花园', icon: '🌿' },
    { key: 'guide', label: '百科', icon: '📖' },
    { key: 'settings', label: '设置', icon: '⚙️' }
  ];
  const [activeNav, setActiveNav] = useState('garden');

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
      url: `/pages/care-guide/index?plant_id=${plantId}`
    });
  };

  const handleAddPlant = () => {
    Taro.navigateTo({
      url: '/pages/camera/index'
    });
  };

  return (
    <View className="garden-page">
      {/* Header */}
      <View className="garden__header">
        <View className="garden__title-area">
          <Text className="garden__title">我的花园</Text>
          <Text className="garden__subtitle">{plants.length} 株植物</Text>
        </View>
      </View>

      {/* Search and filter */}
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

        <View className="garden__filters">
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
        </View>
      </View>

      {/* Priority care section */}
      {priorityPlants.length > 0 && filter === 'all' && (
        <View className="garden__priority">
          <View className="garden__priority-header">
            <Text className="garden__priority-title">🔔 优先护理</Text>
            <Text className="garden__priority-count">{priorityPlants.length} 株需要关注</Text>
          </View>
          <View className="garden__priority-list">
            {priorityPlants.slice(0, 3).map(plant => (
              <View key={plant.id} className="garden__priority-plant" onClick={() => handlePlantClick(plant.id)}>
                <Image
                  src={plant.image_url || ''}
                  mode="aspectFill"
                  className="garden__priority-thumb"
                />
                <View className="garden__priority-info">
                  <Text className="garden__priority-name">{plant.nickname}</Text>
                  <Text className="garden__priority-task">需要{plant.next_task?.type === 'water' ? '浇水' : '护理'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Plant grid */}
      <View className="garden__plants">
        {filteredPlants.length > 0 ? (
          <View className="garden__plant-grid">
            {filteredPlants.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onClick={() => handlePlantClick(plant.id)}
              />
            ))}
          </View>
        ) : (
          <View className="garden__empty">
            <GardenEmptyState onAddPlant={handleAddPlant} />
          </View>
        )}
      </View>

      {/* Add button */}
      <View className="garden__fab" onClick={handleAddPlant}>
        <Text className="garden__fab-icon">+</Text>
      </View>

      {/* Bottom navigation */}
      <View className="garden__nav">
        <SimpleBottomNav
          items={navItems}
          activeKey={activeNav}
          onChange={setActiveNav}
        />
      </View>
    </View>
  );
}
