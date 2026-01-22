import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type PlantDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PlantDetail'>;

function PlantDetailScreen({ navigation, route }: { navigation: PlantDetailScreenNavigationProp; route: any }) {
  const { plantId } = route.params;

  // Mock plant data
  const plant = {
    id: plantId,
    nickname: '小绿',
    speciesName: '龟背竹',
    scientificName: 'Monstera deliciosa',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600',
    location: 'indoor' as const,
    status: 'healthy' as const,
    careProfile: {
      light_requirement: 'partial_shade',
      water_frequency_days: 7,
      temperature_min_c: 15,
      temperature_max_c: 30,
      soil_type: '疏松透气、排水良好',
      difficulty: 'easy' as const,
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
    }
  };

  const tasks = [
    { id: '1', type: 'water', dueAt: new Date().toISOString(), isCompleted: false },
    { id: '2', type: 'fertilize', dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false }
  ];

  const handleCompleteTask = (taskId: string) => {
    // Update task status
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Image */}
      <View style={styles.header}>
        <Image source={{ uri: plant.imageUrl }} style={styles.image} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Plant Info */}
      <View style={styles.infoCard}>
        <Text style={styles.nickname}>{plant.nickname}</Text>
        <Text style={styles.scientificName}>{plant.scientificName}</Text>

        <View style={styles.statusTags}>
          <View style={[styles.statusTag, styles.statusTagGreen]}>
            <Text style={styles.statusTagText}>健康</Text>
          </View>
          <View style={styles.statusTag}>
            <Text style={styles.statusTagTextGray}>室内</Text>
          </View>
        </View>
      </View>

      {/* Care Parameters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>养护参数</Text>
        <View style={styles.paramsGrid}>
          <View style={styles.paramItem}>
            <Text style={styles.paramIcon}>☀️</Text>
            <Text style={styles.paramLabel}>光照</Text>
            <Text style={styles.paramValue}>半阴</Text>
          </View>
          <View style={styles.paramItem}>
            <Text style={styles.paramIcon}>💧</Text>
            <Text style={styles.paramLabel}>浇水</Text>
            <Text style={styles.paramValue}>每7天</Text>
          </View>
          <View style={styles.paramItem}>
            <Text style={styles.paramIcon}>🌡️</Text>
            <Text style={styles.paramLabel}>温度</Text>
            <Text style={styles.paramValue}>15-30°C</Text>
          </View>
          <View style={styles.paramItem}>
            <Text style={styles.paramIcon}>🌱</Text>
            <Text style={styles.paramLabel}>难度</Text>
            <Text style={styles.paramValue}>简单</Text>
          </View>
        </View>
      </View>

      {/* Expert Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>养护建议</Text>
        {plant.careProfile.expert_tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.tipNumber}>{index + 1}</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>待办任务</Text>
        {tasks.map((task) => (
          <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => handleCompleteTask(task.id)}>
            <View style={styles.taskIcon}>
              <Text>{task.type === 'water' ? '💧' : '🧪'}</Text>
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskPlant}>{plant.nickname}</Text>
              <Text style={styles.taskType}>
                {task.type === 'water' ? '浇水' : task.type === 'fertilize' ? '施肥' : '护理'}
              </Text>
            </View>
            <View style={styles.taskTime}>
              <Text style={styles.timeText}>
                {new Date(task.dueAt).toLocaleDateString('zh-CN')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f7'
  },
  content: {
    paddingBottom: 40
  },
  header: {
    position: 'relative',
    height: 280
  },
  image: {
    width: '100%',
    height: '100%'
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backBtnText: {
    fontSize: 20,
    color: '#333'
  },
  infoCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: -30,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  nickname: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333'
  },
  scientificName: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 4
  },
  statusTags: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12
  },
  statusTagGreen: {
    backgroundColor: '#e8f5e9'
  },
  statusTagText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500'
  },
  statusTagTextGray: {
    fontSize: 12,
    color: '#666666'
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16
  },
  paramsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  paramItem: {
    width: '47%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  paramIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  paramLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333'
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f0f9f6',
    borderRadius: 10,
    marginBottom: 8
  },
  tipNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#478575',
    color: '#ffffff',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8
  },
  taskIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  taskInfo: {
    flex: 1
  },
  taskPlant: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333'
  },
  taskType: {
    fontSize: 12,
    color: '#999999'
  },
  taskTime: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#fff3e0',
    borderRadius: 12
  },
  timeText: {
    fontSize: 12,
    color: '#e65100'
  }
});

export default PlantDetailScreen;
