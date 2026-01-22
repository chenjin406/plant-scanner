import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../providers/AuthProvider';

type AddPlantScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddPlant'>;

function AddPlantScreen({ navigation, route }: { navigation: AddPlantScreenNavigationProp; route: any }) {
  const { speciesId } = route.params || {};
  const { user } = useAuth();

  const [nickname, setNickname] = useState('');
  const [location, setLocation] = useState<'indoor' | 'outdoor'>('indoor');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      alert('请输入植物昵称');
      return;
    }

    // Create plant in database
    // Navigate back to garden
    navigation.navigate('Main');
  };

  const locations: Array<'indoor' | 'outdoor'> = ['indoor', 'outdoor'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>添加植物</Text>
      <Text style={styles.subtitle}>为你的植物起个名字吧</Text>

      {/* Nickname */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>植物昵称 *</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：小绿、肉肉、阳光"
          value={nickname}
          onChangeText={setNickname}
          maxLength={20}
        />
      </View>

      {/* Location */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>摆放位置</Text>
        <View style={styles.locationButtons}>
          {locations.map((loc) => (
            <TouchableOpacity
              key={loc}
              style={[styles.locationBtn, location === loc && styles.locationBtnActive]}
              onPress={() => setLocation(loc)}
            >
              <Text style={[styles.locationBtnText, location === loc && styles.locationBtnTextActive]}>
                {loc === 'indoor' ? '🏠 室内' : '🌳 室外'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>备注（可选）</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="添加一些备注..."
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={200}
        />
      </View>

      {/* Care Info */}
      <View style={styles.careInfo}>
        <Text style={styles.careInfoTitle}>💡 养护信息</Text>
        <View style={styles.careInfoContent}>
          <View style={styles.careItem}>
            <Text style={styles.careItemLabel}>浇水频率</Text>
            <Text style={styles.careItemValue}>每 7 天</Text>
          </View>
          <View style={styles.careItem}>
            <Text style={styles.careItemLabel}>光照需求</Text>
            <Text style={styles.careItemValue}>半阴</Text>
          </View>
          <View style={styles.careItem}>
            <Text style={styles.careItemLabel}>养护难度</Text>
            <Text style={styles.careItemValue}>简单</Text>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>添加到花园</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f7'
  },
  content: {
    padding: 20,
    paddingTop: 50
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333'
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    marginBottom: 24
  },
  formGroup: {
    marginBottom: 20
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
    borderColor: '#e0e0e0'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 12
  },
  locationBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  locationBtnActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#478575'
  },
  locationBtnText: {
    fontSize: 15,
    color: '#666666'
  },
  locationBtnTextActive: {
    color: '#478575',
    fontWeight: '600'
  },
  careInfo: {
    backgroundColor: '#fff8e1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffe082'
  },
  careInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 12
  },
  careInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  careItem: {
    alignItems: 'center'
  },
  careItemLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4
  },
  careItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333'
  },
  submitButton: {
    height: 52,
    backgroundColor: '#478575',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  }
});

export default AddPlantScreen;
