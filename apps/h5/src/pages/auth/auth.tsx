import Taro from '@tarojs/taro';
import { View, Text, Input, Button } from '@tarojs/components';
import { useState } from 'react';
import { useAuthStore } from '@plant-scanner/core';
import './auth.scss';

type AuthMode = 'login' | 'register' | 'verify' | 'set-password';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { signIn, signOut } = useAuthStore();

  const isValidPhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone);

  const handleSendCode = async () => {
    if (!isValidPhone(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await Taro.request({
        url: '/api/auth/send-code',
        method: 'POST',
        data: { phone, type: mode }
      });

      if (response.statusCode === 200 && response.data.success) {
        setMode('verify');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        Taro.showToast({ title: '验证码已发送', icon: 'success' });
      } else {
        Taro.showToast({ title: response.data.error || '发送失败', icon: 'none' });
      }
    } catch (error) {
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Taro.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await Taro.request({
        url: '/api/auth/verify-code',
        method: 'POST',
        data: { phone, code, type: mode }
      });

      if (response.statusCode === 200 && response.data.success) {
        if (mode === 'register') {
          // For registration, after verification, set password
          setMode('set-password');
        } else {
          // Login successful
          Taro.setStorageSync('userId', response.data.data.user.id);
          Taro.setStorageSync('token', response.data.data.session.access_token);
          Taro.reLaunch({ url: '/pages/index/index' });
        }
      } else {
        Taro.showToast({ title: response.data.error || '验证失败', icon: 'none' });
      }
    } catch (error) {
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      Taro.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }

    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await Taro.request({
        url: '/api/auth/register',
        method: 'POST',
        data: { phone, password }
      });

      if (response.statusCode === 200 && response.data.success) {
        Taro.setStorageSync('userId', response.data.data.user.id);
        Taro.setStorageSync('token', response.data.data.session.access_token);
        Taro.reLaunch({ url: '/pages/index/index' });
      } else {
        Taro.showToast({ title: response.data.error || '注册失败', icon: 'none' });
      }
    } catch (error) {
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'wechat' | 'apple' | 'google') => {
    setIsLoading(true);
    try {
      const response = await Taro.request({
        url: '/api/auth/oauth',
        method: 'POST',
        data: { provider }
      });

      if (response.statusCode === 200 && response.data.success) {
        // For mini-programs, this would redirect to platform auth
        // For H5, this would open OAuth popup
        Taro.showToast({ title: '正在跳转...', icon: 'none' });
      } else {
        Taro.showToast({ title: response.data.error || '登录失败', icon: 'none' });
      }
    } catch (error) {
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setCode('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <View className="auth-page">
      <View className="auth__logo">
        <Text className="auth__logo-icon">🌿</Text>
        <Text className="auth__logo-text">植物扫描</Text>
      </View>

      <View className="auth__content">
        <Text className="auth__title">
          {mode === 'login' ? '欢迎登录' :
           mode === 'register' ? '注册账号' :
           mode === 'verify' ? '输入验证码' : '设置密码'}
        </Text>

        {mode === 'login' && (
          <>
            <View className="auth__input-group">
              <Text className="auth__label">手机号</Text>
              <Input
                className="auth__input"
                type="number"
                placeholder="请输入手机号"
                value={phone}
                onInput={(e) => setPhone(e.detail.value)}
              />
            </View>
          </>
        )}

        {mode === 'register' && (
          <>
            <View className="auth__input-group">
              <Text className="auth__label">手机号</Text>
              <Input
                className="auth__input"
                type="number"
                placeholder="请输入手机号"
                value={phone}
                onInput={(e) => setPhone(e.detail.value)}
              />
            </View>
          </>
        )}

        {mode === 'verify' && (
          <>
            <View className="auth__verify-info">
              <Text className="auth__verify-text">
                已发送验证码至 {phone.slice(0, 3)}****{phone.slice(-4)}
              </Text>
            </View>
            <View className="auth__input-group">
              <Text className="auth__label">验证码</Text>
              <Input
                className="auth__input auth__input--code"
                type="number"
                placeholder="请输入6位验证码"
                value={code}
                onInput={(e) => setCode(e.detail.value)}
                maxlength={6}
              />
              <Button
                className="auth__code-btn"
                onClick={handleSendCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            </View>
          </>
        )}

        {mode === 'set-password' && (
          <>
            <View className="auth__input-group">
              <Text className="auth__label">设置密码</Text>
              <Input
                className="auth__input"
                type="text"
                password
                placeholder="请设置6位以上密码"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            </View>
            <View className="auth__input-group">
              <Text className="auth__label">确认密码</Text>
              <Input
                className="auth__input"
                type="text"
                password
                placeholder="请再次输入密码"
                value={confirmPassword}
                onInput={(e) => setConfirmPassword(e.detail.value)}
              />
            </View>
          </>
        )}

        {(mode === 'login' || mode === 'register') && (
          <>
            {mode === 'login' && (
              <Button
                className="auth__btn auth__btn--primary"
                onClick={handleSendCode}
                disabled={!isValidPhone(phone) || isLoading}
              >
                {isLoading ? '登录中...' : '验证码登录'}
              </Button>
            )}

            {mode === 'register' && (
              <Button
                className="auth__btn auth__btn--primary"
                onClick={handleSendCode}
                disabled={!isValidPhone(phone) || isLoading}
              >
                {isLoading ? '注册中...' : '获取验证码'}
              </Button>
            )}

            <View className="auth__divider">
              <Text className="auth__divider-text">其他登录方式</Text>
            </View>

            <View className="auth__oauth">
              <View className="auth__oauth-btn" onClick={() => handleOAuthLogin('wechat')}>
                <Text className="auth__oauth-icon">💬</Text>
                <Text className="auth__oauth-text">微信</Text>
              </View>
              <View className="auth__oauth-btn" onClick={() => handleOAuthLogin('apple')}>
                <Text className="auth__oauth-icon">🍎</Text>
                <Text className="auth__oauth-text">Apple</Text>
              </View>
              <View className="auth__oauth-btn" onClick={() => handleOAuthLogin('google')}>
                <Text className="auth__oauth-icon">🔵</Text>
                <Text className="auth__oauth-text">Google</Text>
              </View>
            </View>
          </>
        )}

        {mode === 'verify' && (
          <Button
            className="auth__btn auth__btn--primary"
            onClick={handleVerifyCode}
            disabled={code.length !== 6 || isLoading}
          >
            {isLoading ? '验证中...' : '确认'}
          </Button>
        )}

        {mode === 'set-password' && (
          <Button
            className="auth__btn auth__btn--primary"
            onClick={handleSetPassword}
            disabled={password.length < 6 || isLoading}
          >
            {isLoading ? '注册中...' : '完成注册'}
          </Button>
        )}

        <View className="auth__switch" onClick={switchMode}>
          <Text className="auth__switch-text">
            {mode === 'login' ? '还没有账号？立即注册' : '已有账号？去登录'}
          </Text>
        </View>
      </View>

      <View className="auth__terms">
        <Text className="auth__terms-text">
          登录即表示同意
          <Text className="auth__terms-link">《用户协议》</Text>
          和
          <Text className="auth__terms-link">《隐私政策》</Text>
        </Text>
      </View>
    </View>
  );
}
