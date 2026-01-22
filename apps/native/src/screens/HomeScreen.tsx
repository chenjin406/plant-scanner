import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../providers/AuthProvider';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  const { userProfile } = useAuth();
  const userName = userProfile?.nickname || '用户';

  const handleScan = () => {
    navigation.navigate('Camera', { from: 'scan' });
  };

  const todayTasks = [
    { id: '1', plant: '小绿', type: '浇水', time: '今天' },
    { id: '2', plant: '肉肉', type: '施肥', time: '明天' }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>你好，{userName}</Text>
          <Text style={styles.date}>今天也要好好照顾植物哦 🌱</Text>
        </View>
      </View>

      {/* Scan Button */}
      <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
        <View style={styles.scanButtonInner}>
          <Text style={styles.scanIcon}>📷</Text>
          <Text style={styles.scanText}>扫描识别</Text>
        </View>
      </TouchableOpacity>

      {/* Today's Tasks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日任务</Text>
          <Text style={styles.sectionMore}>查看全部</Text>
        </View>

        {todayTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskIcon}>
              <Text>{task.type === '浇水' ? '💧' : '🧪'}</Text>
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskPlant}>{task.plant}</Text>
              <Text style={styles.taskType}>{task.type}</Text>
            </View>
            <View style={styles.taskTime}>
              <Text style={styles.timeText}>{task.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>快捷入口</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Camera', { from: 'add' })}
          >
            <Text style={styles.quickActionIcon}>➕</Text>
            <Text style={styles.quickActionText}>添加植物</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Garden')}
          >
            <Text style={styles.quickActionIcon}>🌿</Text>
            <Text style={styles.quickActionText}>我的花园</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.quickActionIcon}>🔍</Text>
            <Text style={styles.quickActionText}>搜索植物</Text>
          </TouchableOpacity>
        </View>
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
    padding: 16
  },
  header: {
    marginBottom: 20
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4
  },
  date: {
    fontSize: 14,
    color: '#999999'
  },
  scanButton: {
    backgroundColor: '#478575',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center'
  },
  scanButtonInner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scanIcon: {
    fontSize: 24,
    marginRight: 8
  },
  scanText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333'
  },
  sectionMore: {
    fontSize: 13,
    color: '#478575'
  },
  taskCard: {
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
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  quickAction: {
    alignItems: 'center',
    padding: 12
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8
  },
  quickActionText: {
    fontSize: 12,
    color: '#666666'
  }
});

export default HomeScreen;
