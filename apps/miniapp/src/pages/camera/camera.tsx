import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import { useState, useRef } from 'react';
import './camera.scss';

type CameraState = 'preview' | 'photo' | 'identifying';

export default function CameraPage() {
  const [state, setState] = useState<CameraState>('preview');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useDidShow(() => {
    // Initialize camera
  });

  useDidHide(() => {
    // Cleanup
  });

  const handleCapture = () => {
    // For miniapp, use Taro chooseImage or camera context
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        setCapturedImage(tempFilePath);
        setState('photo');
      },
      fail: () => {
        // Fallback for demo
        setCapturedImage('https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400');
        setState('photo');
      }
    });
  };

  const handleRetake = () => {
    setCapturedImage('');
    setState('preview');
  };

  const handleIdentify = () => {
    if (!capturedImage) return;

    setState('identifying');
    setIsLoading(true);

    Taro.request({
      url: '/api/identify',
      method: 'POST',
      data: { image: capturedImage },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          Taro.navigateTo({
            url: `/pages/result/index?scan_id=${res.data.data.scan_id}`
          });
        } else {
          Taro.showToast({ title: '识别失败，请重试', icon: 'none' });
          setState('photo');
        }
      },
      fail: () => {
        Taro.showToast({ title: '网络错误', icon: 'none' });
        setState('photo');
      },
      complete: () => {
        setIsLoading(false);
      }
    });
  };

  const handleChooseAlbum = () => {
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        setCapturedImage(res.tempFiles[0].tempFilePath);
        setState('photo');
      }
    });
  };

  const handleFlipCamera = () => {
    setCameraFacing(cameraFacing === 'back' ? 'front' : 'back');
  };

  return (
    <View className="camera-page">
      {/* Camera View */}
      <View className="camera__viewport">
        {state === 'preview' && (
          <View className="camera__preview">
            <Image
              src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600"
              mode="aspectFill"
              className="camera__placeholder"
            />
            {/* Scanning Frame */}
            <View className="camera__frame">
              <View className="camera__frame-corner camera__frame-corner--tl"></View>
              <View className="camera__frame-corner camera__frame-corner--tr"></View>
              <View className="camera__frame-corner camera__frame-corner--bl"></View>
              <View className="camera__frame-corner camera__frame-corner--br"></View>
            </View>
            {/* Tip */}
            <View className="camera__tip">
              <Text className="camera__tip-icon">☀️</Text>
              <Text>请确保光线充足</Text>
            </View>
          </View>
        )}

        {state === 'photo' && (
          <Image src={capturedImage} mode="aspectFill" className="camera__photo" />
        )}

        {state === 'identifying' && (
          <View className="camera__identifying">
            <Text className="camera__identifying-icon">🔍</Text>
            <Text className="camera__identifying-text">正在识别植物...</Text>
          </View>
        )}
      </View>

      {/* Top Controls */}
      <View className="camera__top">
        <View className="camera__scan-mode">
          <Text>扫描模式</Text>
        </View>
        <View className="camera__flash" onClick={() => setFlashMode(f => f === 'off' ? 'on' : 'off')}>
          <Text>{flashMode === 'off' ? '⚡' : '🔥'}</Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View className="camera__bottom">
        {state === 'photo' ? (
          <View className="camera__review-controls">
            <Button className="camera__btn camera__btn--secondary" onClick={handleRetake}>重拍</Button>
            <Button className="camera__btn camera__btn--primary" onClick={handleIdentify}>开始识别</Button>
          </View>
        ) : (
          <View className="camera__controls">
            <View className="camera__album" onClick={handleChooseAlbum}>
              <Image
                src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=100"
                mode="aspectFill"
                className="camera__album-thumb"
              />
              <Text className="camera__album-label">相册</Text>
            </View>

            <View className="camera__capture" onClick={handleCapture}>
              <View className="camera__capture-ring">
                <View className="camera__capture-btn"></View>
              </View>
            </View>

            <View className="camera__flip" onClick={handleFlipCamera}>
              <Text className="camera__flip-icon">🔄</Text>
              <Text className="camera__flip-label">翻转</Text>
            </View>
          </View>
        )}

        {/* Bottom Navigation */}
        <View className="camera__nav">
          <View className="camera__nav-item">
            <Text className="camera__nav-icon">🏠</Text>
          </View>
          <View className="camera__nav-item camera__nav-item--active">
            <Text className="camera__nav-icon">📷</Text>
          </View>
          <View className="camera__nav-item">
            <Text className="camera__nav-icon">🌿</Text>
          </View>
          <View className="camera__nav-item">
            <Text className="camera__nav-icon">📖</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

CameraPage.config = {
  navigationBarTitleText: '植物识别',
  navigationStyle: 'custom'
};
