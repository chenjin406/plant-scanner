import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

function AuthScreen({ navigation }: { navigation: AuthScreenNavigationProp }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithPhone, verifyOTP } = useAuth();

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithPhone(phone);
      setIsCodeSent(true);
      Alert.alert('提示', '验证码已发送');
    } catch (error: any) {
      Alert.alert('错误', error.message || '发送失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(phone, code);
    } catch (error: any) {
      Alert.alert('错误', error.message || '验证失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.title}>植物扫描</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>手机号</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入手机号"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={11}
            editable={!isCodeSent}
          />

          {isCodeSent && (
            <>
              <Text style={styles.label}>验证码</Text>
              <View style={styles.codeRow}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="请输入验证码"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleSendCode}
                  disabled={isLoading}
                >
                  <Text style={styles.resendBtnText}>重新发送</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={isCodeSent ? handleVerify : handleSendCode}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '请稍候...' : isCodeSent ? '验证登录' : '获取验证码'}
            </Text>
          </TouchableOpacity>

          <View style={styles.terms}>
            <Text style={styles.termsText}>
              登录即表示同意
              <Text style={styles.termsLink}>《用户协议》</Text>
              和
              <Text style={styles.termsLink}>《隐私政策》</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f7'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48
  },
  logo: {
    fontSize: 64,
    marginBottom: 12
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#478575'
  },
  form: {
    flex: 1
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8
  },
  input: {
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  codeInput: {
    flex: 1,
    marginBottom: 16
  },
  resendBtn: {
    marginLeft: 12,
    padding: 16
  },
  resendBtnText: {
    color: '#478575',
    fontSize: 14
  },
  button: {
    height: 52,
    backgroundColor: '#478575',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  terms: {
    marginTop: 32,
    alignItems: 'center'
  },
  termsText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center'
  },
  termsLink: {
    color: '#478575'
  }
});

export default AuthScreen;
