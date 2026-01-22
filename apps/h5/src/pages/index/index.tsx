import { definePageConfig } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import './index.scss';

export default function Index() {
  const [count, setCount] = useState(0);

  return (
    <View className="index">
      <View className="header">
        <Text className="title">Plant Scanner</Text>
        <Text className="subtitle">植物扫描与花园管理</Text>
      </View>
      <View className="content">
        <Text className="welcome">欢迎使用植物扫描应用</Text>
        <View className="counter">
          <Text>Count: {count}</Text>
          <button onClick={() => setCount(count + 1)}>+1</button>
        </View>
      </View>
    </View>
  );
}

Index.config = definePageConfig({
  navigationBarTitleText: '首页'
});
