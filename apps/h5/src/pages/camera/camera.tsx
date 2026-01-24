import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import { View, Text, Image, Button } from '@tarojs/components';
import { useState, useRef } from 'react';
import { plantIdentificationService } from '@plant-scanner/core';
import './camera.scss';

type CameraState = 'preview' | 'photo' | 'identifying';

// Detect H5 environment
const isH5 = typeof window !== 'undefined';

export default function CameraPage() {
  const [state, setState] = useState<CameraState>('preview');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const cameraContext = useRef<any>(null);

  const handleNavigate = (url?: string) => {
    if (url) {
      Taro.navigateTo({ url });
      return;
    }

    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  useDidShow(() => {
    // Skip camera initialization in H5 environment
    if (isH5 || typeof (Taro as any).createCameraInstance !== 'function') {
      console.log('H5 environment detected, using file input instead');
      return;
    }

    // Initialize camera on show (mini-program only)
    (Taro as any).createCameraInstance({
      maxDuration: 60,
      devicePosition: cameraFacing,
      flash: flashMode,
    })
      .then((ctx: any) => {
        cameraContext.current = ctx;
        ctx.start();
      })
      .catch((err: any) => {
        console.error('Camera init error:', err);
      });
  });

  useDidHide(() => {
    cameraContext.current?.stop();
  });

  const handleCapture = () => {
    // In H5 environment, trigger file input instead
    if (isH5 || !cameraContext.current) {
      handleChooseAlbum();
      return;
    }

    cameraContext.current.takePhoto({
      quality: 'high',
      success: (res: any) => {
        setCapturedImage(res.tempImagePath);
        setState('photo');
      },
      fail: (err: any) => {
        console.error('Capture error:', err);
        Taro.showToast({
          title: '拍照失败，请重试',
          icon: 'none'
        });
      },
    });
  };

  const handleRetake = () => {
    setCapturedImage('');
    setState('preview');
  };

  const handleIdentify = async () => {
    if (!capturedImage) return;

    setState('identifying');
    setIsLoading(true);

    try {
      const userId = Taro.getStorageSync('userId') || undefined;
      const result = await plantIdentificationService.identifyPlant(capturedImage, userId);

      if (result.success && result.data) {
        // Navigate to result page with data
        Taro.navigateTo({
          url: `/pages/result/result?scan_id=${result.data.scan_id}`,
        });
      } else if (result.data?.threshold_met === false) {
        // Low confidence - show error with suggestion
        Taro.showModal({
          title: '识别准确率不足',
          content: result.error || '请提供更清晰的照片或尝试手动搜索',
          showCancel: false,
          confirmText: '知道了',
        });
        setState('photo');
      } else {
        Taro.showToast({
          title: result.error || '识别失败，请重试',
          icon: 'none',
          duration: 3000,
        });
        setState('photo');
      }
    } catch (error: any) {
      console.error('Identify error:', error);
      Taro.showToast({
        title: '网络错误，请检查连接后重试',
        icon: 'none',
        duration: 3000,
      });
      setState('photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseAlbum = () => {
    // H5 environment - use file input
    if (isH5) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            setCapturedImage(event.target.result);
            setState('photo');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    // Mini-program environment
    Taro.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: (res) => {
        setCapturedImage(res.tempFilePaths[0]);
        setState('photo');
      },
    });
  };

  const handleFlipCamera = () => {
    const newFacing = cameraFacing === 'back' ? 'front' : 'back';
    setCameraFacing(newFacing);
    cameraContext.current?.switchCamera({ devicePosition: newFacing });
  };

  const handleFlashToggle = () => {
    const modes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlashMode(modes[nextIndex]);
    cameraContext.current?.setFlash({ flash: modes[nextIndex] });
  };

  return (
    <View className="camera-page">
      <Image
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6diuz0kF4yNxA6x8j_bIELMDmowE17CnAYUSgm1Aut1XLUrywHEkA9oDl-gC_cK-5HX4v050fohi_WCM5TkHiTk-yRpEfb-VMrCVzSY6AtEYSICcnM3qEesZVmzhMHw3ZOeEBPz57ldCPJvc7W_6OOwfxYV6zZQS8I5Br5xF0-quf8sF79bHoy1lMnUkgTHFrG-dZ1v1NwmQS-2SN0latTlUiFhcpJEsJTQVYKPVS3rwkzuTX0lOiBVIHzenDxTMH8QscY4NSERri"
        mode="aspectFill"
        className="camera-page__bg-image"
      />

      <View className="camera__viewport">
        {(state === 'preview' || state === 'photo') && (
          <View className="camera__preview">
            <Image
              src={state === 'photo' ? capturedImage : 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'}
              mode="aspectFill"
              className="camera__placeholder"
            />
            <View className="camera__frame">
              <View className="camera__frame-corner camera__frame-corner--tl"></View>
              <View className="camera__frame-corner camera__frame-corner--tr"></View>
              <View className="camera__frame-corner camera__frame-corner--bl"></View>
              <View className="camera__frame-corner camera__frame-corner--br"></View>
              <View className="camera__frame-center"></View>
            </View>
            <View className="camera__tip">
              <Text className="camera__tip-icon">☀️</Text>
              <Text>请确保光线充足</Text>
            </View>
          </View>
        )}

        {state === 'identifying' && (
          <View className="camera__identifying">
            <View className="camera__identifying-animation">
              <Text className="camera__identifying-icon">🔍</Text>
              <Text className="camera__identifying-text">正在识别植物...</Text>
            </View>
            <View className="camera__identifying-progress"></View>
          </View>
        )}
      </View>

      <View className="camera__top">
        <View className="camera__top-left" onClick={() => Taro.navigateBack()}>
          <Text className="camera__top-icon">✕</Text>
        </View>
        <View className="camera__scan-mode">
          <Text>扫描模式</Text>
        </View>
        <View className="camera__flash" onClick={handleFlashToggle}>
          <Text>{flashMode === 'off' ? '⚡' : flashMode === 'on' ? '🔥' : '🔆'}</Text>
        </View>
      </View>

      <View className="camera__bottom">
        <View className="camera__controls">
          <View className="camera__album" onClick={handleChooseAlbum}>
            {capturedImage ? (
              <Image src={capturedImage} mode="aspectFill" className="camera__album-thumb" />
            ) : (
              <View className="camera__album-thumb"></View>
            )}
            <Text className="camera__album-label">相册</Text>
          </View>

          <View
            className={`camera__capture ${state === 'identifying' ? 'camera__capture--disabled' : ''}`}
            onClick={state === 'identifying' ? undefined : handleCapture}
          >
            <View className="camera__capture-ring"></View>
            <View className="camera__capture-btn">
              <Text className="camera__capture-icon">🪴</Text>
            </View>
          </View>

          <View className="camera__flip" onClick={handleFlipCamera}>
            <Text className="camera__flip-icon">🔄</Text>
            <Text className="camera__flip-label">翻转</Text>
          </View>
        </View>

        {state === 'photo' && (
          <View className="camera__review-controls">
            <Button className="camera__btn camera__btn--ghost" onClick={handleRetake}>
              重拍
            </Button>
            <Button className="camera__btn camera__btn--primary" onClick={handleIdentify}>
              开始识别
            </Button>
          </View>
        )}

        <View className="camera__nav">
          <View className="camera__nav-item" onClick={() => handleNavigate('/pages/index/index')}>
            <Text className="camera__nav-icon">🏠</Text>
            <Text className="camera__nav-text">首页</Text>
          </View>
          <View className="camera__nav-item" onClick={() => handleNavigate('/pages/garden/garden')}>
            <Text className="camera__nav-icon">🌿</Text>
            <Text className="camera__nav-text">花园</Text>
          </View>
          <View className="camera__nav-item camera__nav-item--active">
            <View className="camera__nav-fab">
              <Text className="camera__nav-fab-icon">📷</Text>
            </View>
            <Text className="camera__nav-text">识别</Text>
          </View>
          <View className="camera__nav-item" onClick={() => handleNavigate('/pages/search/search')}>
            <Text className="camera__nav-icon">📖</Text>
            <Text className="camera__nav-text">百科</Text>
          </View>
          <View className="camera__nav-item" onClick={() => handleNavigate()}>
            <Text className="camera__nav-icon">👤</Text>
            <Text className="camera__nav-text">我的</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
