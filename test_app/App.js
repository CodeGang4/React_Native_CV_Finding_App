import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import NoticeScreen from './screens/NoticeScreen';
import ProfileScreen from './screens/ProfileScreen';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';

const JobsStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function JobsStackScreen() {
  return (
    <JobsStack.Navigator>
      <JobsStack.Screen name="Home" component={HomeScreen} options={{ title: 'Jobs' }} />
      <JobsStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job detail' }} />
    </JobsStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Jobs" component={JobsStackScreen} options={{ tabBarLabel: 'Jobs' }} />
        <Tab.Screen name="Notice" component={NoticeScreen} options={{ tabBarLabel: 'Notice' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppNavigator />
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  tabLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#ff3333',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
