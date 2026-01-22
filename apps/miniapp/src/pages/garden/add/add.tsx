import Taro, { useLoad } from '@tarojs/taro';
import { View, Text, Input, Button, Image } from '@tarojs/components';
import { useState } from 'react';
import './add.scss';

export default function AddPlant() {
  const [plantName, setPlantName] = useState('');
  const [plantType, setPlantType] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useLoad(() => {
    console.log('Add plant page loaded');
  });

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        setImageUrl(res.tempFilePaths[0]);
      }
    });
  };

  const handleSave = () => {
    if (!plantName) {
      Taro.showToast({ title: '请输入植物名称', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '保存中...' });

    // Simulate API call
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }, 1000);
  };

  return (
    <View className='add-plant-container'>
      <View className='image-section' onClick={handleChooseImage}>
        {imageUrl ? (
          <Image mode='aspectFill' src={imageUrl} className='plant-image' />
        ) : (
          <View className='image-placeholder'>
            <Text className='add-icon'>+</Text>
            <Text className='add-text'>上传植物照片</Text>
          </View>
        )}
      </View>

      <View className='form-section'>
        <View className='form-item'>
          <Text className='form-label'>植物名称 *</Text>
          <Input
            className='form-input'
            placeholder='请输入植物名称'
            value={plantName}
            onInput={(e) => setPlantName(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>植物类型</Text>
          <Input
            className='form-input'
            placeholder='如：多肉、绿萝、吊兰'
            value={plantType}
            onInput={(e) => setPlantType(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>摆放位置</Text>
          <Input
            className='form-input'
            placeholder='如：客厅阳台、卧室窗台'
            value={location}
            onInput={(e) => setLocation(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>养护备注</Text>
          <Input
            className='form-input'
            placeholder='记录植物的特点和养护要点'
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
          />
        </View>
      </View>

      <View className='button-section'>
        <Button className='save-button' onClick={handleSave}>
          保存
        </Button>
      </View>
    </View>
  );
}
