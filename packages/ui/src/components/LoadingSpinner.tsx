import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Loading } from '@nutui/nutui-react-taro';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingSpinner({ text = '加载中...', size = 'large', fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <View className={`loading-spinner loading-spinner--${size}`}>
      <Loading type="circular" />
      {text && <Text className="loading-spinner__text">{text}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="loading-spinner__fullscreen">
        {content}
      </View>
    );
  }

  return content;
}

interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = '页面加载中...' }: PageLoadingProps) {
  return (
    <View className="page-loading">
      <View className="page-loading__content">
        <Loading type="circular" size="large" />
        <Text className="page-loading__text">{text}</Text>
      </View>
    </View>
  );
}
