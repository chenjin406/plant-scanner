import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import CameraRoll from '@react-native-community/cameraroll';

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

function CameraScreen({ navigation, route }: { navigation: CameraScreenNavigationProp; route: any }) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [showAlbum, setShowAlbum] = useState(false);

  const handleTakePhoto = async () => {
    const result: ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      cameraType: cameraFacing === 'back' ? 'back' : 'front'
    });

    if (result.assets && result.assets[0]?.uri) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handleChooseAlbum = async () => {
    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1
    });

    if (result.assets && result.assets[0]?.uri) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleIdentify = async () => {
    if (!capturedImage) return;

    // Navigate to result page
    navigation.navigate('Result', { scanId: `scan_${Date.now()}` });
  };

  const handleFlashToggle = () => {
    const modes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flashMode);
    setFlashMode(modes[(currentIndex + 1) % modes.length]);
  };

  const handleFlipCamera = () => {
    setCameraFacing(cameraFacing === 'back' ? 'front' : 'back');
  };

  return (
    <View style={styles.container}>
      {/* Camera Preview / Captured Image */}
      <View style={styles.previewContainer}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>📷</Text>
            <Text style={styles.placeholderHint}>点击拍照或从相册选择</Text>
          </View>
        )}

        {/* Scanning Frame */}
        {!capturedImage && (
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        )}
      </View>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => navigation.goBack()}>
          <Text style={styles.controlIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleFlashToggle}>
          <Text style={styles.controlIcon}>
            {flashMode === 'off' ? '⚡' : flashMode === 'on' ? '🔥' : '🔆'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.controlsRow}>
          {/* Album */}
          <TouchableOpacity style={styles.albumButton} onPress={handleChooseAlbum}>
            <View style={styles.albumThumb}>
              <Text style={styles.albumIcon}>🖼️</Text>
            </View>
            <Text style={styles.albumLabel}>相册</Text>
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
            <View style={styles.captureRing}>
              <View style={styles.captureBtn} />
            </View>
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity style={styles.flipButton} onPress={handleFlipCamera}>
            <Text style={styles.flipIcon}>🔄</Text>
            <Text style={styles.flipLabel}>翻转</Text>
          </TouchableOpacity>
        </View>

        {/* Review Controls */}
        {capturedImage && (
          <View style={styles.reviewControls}>
            <TouchableOpacity style={styles.reviewBtn} onPress={handleRetake}>
              <Text style={styles.reviewBtnText}>重拍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reviewBtn, styles.reviewBtnPrimary]}
              onPress={handleIdentify}
            >
              <Text style={[styles.reviewBtnText, styles.reviewBtnTextPrimary]}>开始识别</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  previewContainer: {
    flex: 1,
    position: 'relative'
  },
  preview: {
    width: '100%',
    height: '100%'
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a'
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 16
  },
  placeholderHint: {
    fontSize: 14,
    color: '#999999'
  },
  scanFrame: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    width: '70%',
    height: 280,
    justifyContent: 'center',
    alignItems: 'center'
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#478575',
    borderStyle: 'solid'
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  controlIcon: {
    fontSize: 20,
    color: '#ffffff'
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 32
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  albumButton: {
    alignItems: 'center'
  },
  albumThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  albumIcon: {
    fontSize: 24
  },
  albumLabel: {
    fontSize: 11,
    color: '#ffffff'
  },
  captureButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center'
  },
  captureRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5
  },
  captureBtn: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 32
  },
  flipButton: {
    alignItems: 'center'
  },
  flipIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  flipLabel: {
    fontSize: 11,
    color: '#ffffff'
  },
  reviewControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    marginTop: 20
  },
  reviewBtn: {
    flex: 1,
    maxWidth: 150,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  reviewBtnPrimary: {
    backgroundColor: '#478575'
  },
  reviewBtnText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500'
  },
  reviewBtnTextPrimary: {
    color: '#ffffff'
  }
});

export default CameraScreen;
