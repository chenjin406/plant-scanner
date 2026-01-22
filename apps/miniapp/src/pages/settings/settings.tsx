import Taro, { useLoad } from '@tarojs/taro';
import { View, Text, Switch, Button } from '@tarojs/components';
import { useState } from 'react';
import './settings.scss';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoIdentify, setAutoIdentify] = useState(true);

  useLoad(() => {
    console.log('Settings page loaded');
  });

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('token');
          Taro.reLaunch({ url: '/pages/auth/auth' });
        }
      }
    });
  };

  const handleClearCache = () => {
    Taro.showLoading({ title: '清理中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '缓存已清理', icon: 'success' });
    }, 1000);
  };

  const handleAbout = () => {
    Taro.showModal({
      title: '关于植物扫描仪',
      content: '植物扫描仪 v1.0.0\n\n一款可以帮助您识别植物、管理花园的智能应用。',
      showCancel: false
    });
  };

  return (
    <View className='settings-container'>
      <View className='settings-group'>
        <View className='settings-item'>
          <Text className='settings-label'>消息通知</Text>
          <Switch
            checked={notifications}
            onChange={(e) => setNotifications(e.detail.value)}
            color='#4CAF50'
          />
        </View>

        <View className='settings-item'>
          <Text className='settings-label'>深色模式</Text>
          <Switch
            checked={darkMode}
            onChange={(e) => setDarkMode(e.detail.value)}
            color='#4CAF50'
          />
        </View>

        <View className='settings-item'>
          <Text className='settings-label'>自动识别</Text>
          <Switch
            checked={autoIdentify}
            onChange={(e) => setAutoIdentify(e.detail.value)}
            color='#4CAF50'
          />
        </View>
      </View>

      <View className='settings-group'>
        <View className='settings-item' onClick={handleClearCache}>
          <Text className='settings-label'>清理缓存</Text>
          <Text className='settings-arrow'>&gt;</Text>
        </View>

        <View className='settings-item' onClick={handleAbout}>
          <Text className='settings-label'>关于</Text>
          <Text className='settings-arrow'>&gt;</Text>
        </View>
      </View>

      <View className='settings-footer'>
        <Button className='logout-btn' onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </View>
  );
}
