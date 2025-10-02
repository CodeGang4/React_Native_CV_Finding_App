import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CandidateHomeScreen from '../screens/candidate/CandidateHomeScreen';
import JobSearchScreen from '../screens/candidate/JobSearchScreen';
import ApplicationsScreen from '../screens/candidate/ApplicationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Stack = createStackNavigator();

export default function CandidateNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="CandidateHome"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#00b14f',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen 
                name="CandidateHome" 
                component={CandidateHomeScreen}
                options={{ title: 'Trang chủ' }}
            />
            <Stack.Screen 
                name="JobSearch" 
                component={JobSearchScreen}
                options={{ title: 'Tìm việc làm' }}
            />
            <Stack.Screen 
                name="Applications" 
                component={ApplicationsScreen}
                options={{ title: 'Đơn ứng tuyển' }}
            />
            <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ title: 'Hồ sơ' }}
            />
        </Stack.Navigator>
    );
}