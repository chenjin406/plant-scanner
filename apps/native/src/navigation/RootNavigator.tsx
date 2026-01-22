import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import AuthScreen from '../screens/AuthScreen';
import TabNavigator from './TabNavigator';
import CameraScreen from '../screens/CameraScreen';
import ResultScreen from '../screens/ResultScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';
import AddPlantScreen from '../screens/AddPlantScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Camera: { from?: 'scan' | 'add' };
  Result: { scanId: string };
  PlantDetail: { plantId: string };
  AddPlant: { speciesId?: string };
};

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    // Show loading screen
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
          <Stack.Screen name="AddPlant" component={AddPlantScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
