import { definePageConfig } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

export default function Index() {
  return (
    <View className="index">
      <View className="header">
        <Text className="title">Plant Scanner</Text>
        <Text className="subtitle">植物扫描与花园管理</Text>
      </View>
    </View>
  );
}

Index.config = definePageConfig({
  navigationBarTitleText: '首页'
});
