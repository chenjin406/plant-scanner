import { View, Text, Image, ScrollView } from '@tarojs/components';
import { useTodayTasks, useUserProfile } from '@plant-scanner/core';
import './index.scss';

export default function Index() {
  const userId = '00000000-0000-0000-0000-000000000001'; // TODO: Get from auth store
  const { data: userProfile } = useUserProfile(userId);
  const { data: tasksData } = useTodayTasks(userId);
  const tasks = tasksData?.data || [];

  return (
    <View className="index">
      <View className="header">
        <Text className="title">
          {userProfile?.data?.nickname ? `你好，${userProfile.data.nickname}` : 'Plant Scanner'}
        </Text>
        <Text className="subtitle">植物扫描与花园管理</Text>
      </View>
      
      <View className="section">
        <Text className="section-title">今日任务</Text>
        <ScrollView className="tasks-scroll" scrollY>
          {tasks.length > 0 ? (
            tasks.map((task: any) => (
              <View key={task.id} className="task-item">
                <Text>{task.user_plant?.nickname} - {task.task_type === 'water' ? '浇水' : '护理'}</Text>
              </View>
            ))
          ) : (
            <Text className="empty-text">今日暂无任务</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
