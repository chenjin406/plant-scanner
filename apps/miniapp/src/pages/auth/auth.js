import { View, Text } from '@tarojs/components';
import './auth.scss';

export default function AuthPage() {
  return (
    <View className="auth-page">
      <Text>Auth Page</Text>
    </View>
  );
}

AuthPage.config = definePageConfig({
  navigationBarTitleText: '登录',
  navigationStyle: 'custom'
});
