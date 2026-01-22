import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, BottomTabParamList } from '../navigation/RootNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';

type GardenScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'Main'>,
  BottomTabNavigationProp<BottomTabParamList, 'Garden'>
>;

interface Plant {
  id: string;
  nickname: string;
  speciesName: string;
  status: 'healthy' | 'needs_attention' | 'dying';
  location: 'indoor' | 'outdoor';
  imageUrl?: string;
}

const mockPlants: Plant[] = [
  {
    id: '1',
    nickname: '小绿',
    speciesName: '龟背竹',
    status: 'healthy',
    location: 'indoor',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=200'
  },
  {
    id: '2',
    nickname: '肉肉',
    speciesName: '多肉植物',
    status: 'needs_attention',
    location: 'indoor',
    imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200'
  },
  {
    id: '3',
    nickname: '阳光',
    speciesName: '绿萝',
    status: 'healthy',
    location: 'outdoor',
    imageUrl: 'https://images.unsplash.com/photo-1596724852267-1a8340e73258?w=200'
  }
];

type FilterType = 'all' | 'indoor' | 'outdoor' | 'needs_water';

function GardenScreen({ navigation }: { navigation: GardenScreenNavigationProp }) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlants = mockPlants.filter((plant) => {
    if (filter === 'indoor' && plant.location !== 'indoor') return false;
    if (filter === 'outdoor' && plant.location !== 'outdoor') return false;
    if (filter === 'needs_water' && plant.status !== 'needs_attention') return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        plant.nickname.toLowerCase().includes(query) ||
        plant.speciesName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handlePlantPress = (plantId: string) => {
    navigation.navigate('PlantDetail', { plantId });
  };

  const handleAddPlant = () => {
    navigation.navigate('Camera', { from: 'add' });
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

  const renderPlantItem = ({ item }: { item: Plant }) => (
    <TouchableOpacity style={styles.plantCard} onPress={() => handlePlantPress(item.id)}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.plantImage}
        defaultSource={require('../assets/placeholder.png')}
      />
      <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
        <Text style={styles.statusText}>{statusTexts[item.status]}</Text>
      </View>
      <View style={styles.plantInfo}>
        <Text style={styles.plantNickname}>{item.nickname}</Text>
        <Text style={styles.plantSpecies}>{item.speciesName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>我的花园</Text>
        <Text style={styles.subtitle}>{mockPlants.length} 株植物</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInputField}
            placeholder="搜索植物..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'indoor', 'outdoor', 'needs_water'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTag, filter === f && styles.filterTagActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? '全部' : f === 'indoor' ? '室内' : f === 'outdoor' ? '室外' : '需浇水'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plant Grid */}
      <FlatList
        data={filteredPlants}
        renderItem={renderPlantItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.plantList}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPlant}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f7'
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#478575'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff'
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4
  },
  searchContainer: {
    padding: 16
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8
  },
  searchInputField: {
    flex: 1,
    fontSize: 15
  },
  filterContainer: {
    marginBottom: 8
  },
  filterContent: {
    paddingHorizontal: 16
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: 8
  },
  filterTagActive: {
    backgroundColor: '#478575'
  },
  filterText: {
    fontSize: 13,
    color: '#666666'
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600'
  },
  plantList: {
    padding: 8
  },
  plantCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  plantImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0'
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500'
  },
  plantInfo: {
    padding: 12
  },
  plantNickname: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333'
  },
  plantSpecies: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    backgroundColor: '#478575',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#478575',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  fabIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300'
  }
});

export default GardenScreen;
