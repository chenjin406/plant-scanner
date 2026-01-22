import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import GardenScreen from '../screens/GardenScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type BottomTabParamList = {
  Home: undefined;
  Garden: undefined;
  Search: undefined;
  Settings: undefined;
};

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Garden: '🌿',
  Search: '🔍',
  Settings: '⚙️'
};

function TabNavigator() {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icon = TAB_ICONS[route.name] || '📋';
          return (
            <View style={styles.tabIcon}>
              <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>
                {icon}
              </Text>
            </View>
          );
        },
        tabBarLabel: ({ focused }) => {
          const labels: Record<string, string> = {
            Home: '首页',
            Garden: '花园',
            Search: '搜索',
            Settings: '设置'
          };
          return (
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {labels[route.name]}
            </Text>
          );
        },
        tabBarStyle: styles.tabBar
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Garden" component={GardenScreen} />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        listeners={{
          tabPress: (e) => {
            // Navigate with params to trigger camera from search
          }
        }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 88,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabIconText: {
    fontSize: 24,
    opacity: 0.6
  },
  tabIconTextActive: {
    opacity: 1
  },
  tabLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4
  },
  tabLabelActive: {
    color: '#478575',
    fontWeight: '600'
  }
});

export default TabNavigator;
