import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../providers/AuthProvider';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

function SettingsScreen({ navigation }: { navigation: SettingsScreenNavigationProp }) {
  const { user, userProfile, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: () => signOut()
      }
    ]);
  };

  const handlePrivacy = () => {
    // Navigate to privacy policy
  };

  const handleAbout = () => {
    Alert.alert('关于', '植物扫描 v1.0.0\n\n植物识别与花园管理工具', [{ text: '确定' }]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userProfile?.nickname?.charAt(0) || user?.phone?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.nickname}>{userProfile?.nickname || '用户'}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>
      </View>

      {/* Settings Groups */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通用设置</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🌐</Text>
            <Text style={styles.settingLabel}>语言</Text>
          </View>
          <Text style={styles.settingValue}>中文</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingLabel}>消息通知</Text>
          </View>
          <Switch value={true} onValueChange={() => {}} trackColor={{ false: '#e0e0e0', true: '#478575' }} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🌙</Text>
            <Text style={styles.settingLabel}>深色模式</Text>
          </View>
          <Switch value={false} onValueChange={() => {}} trackColor={{ false: '#e0e0e0', true: '#478575' }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据管理</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>☁️</Text>
            <Text style={styles.settingLabel}>数据同步</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>💾</Text>
            <Text style={styles.settingLabel}>导出数据</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🗑️</Text>
            <Text style={styles.settingLabel}>清除缓存</Text>
          </View>
          <Text style={styles.settingValue}>12.5 MB</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={styles.settingLabel}>隐私政策</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>ℹ️</Text>
            <Text style={styles.settingLabel}>关于我们</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>⭐</Text>
            <Text style={styles.settingLabel}>评价应用</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>

      <Text style={styles.version}>v1.0.0</Text>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#478575'
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#478575'
  },
  profileInfo: {
    marginLeft: 16
  },
  nickname: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff'
  },
  phone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    paddingHorizontal: 16
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999999',
    paddingVertical: 12
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333'
  },
  settingValue: {
    fontSize: 14,
    color: '#999999'
  },
  settingArrow: {
    fontSize: 20,
    color: '#cccccc'
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336'
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    marginTop: 24
  }
});

export default SettingsScreen;
