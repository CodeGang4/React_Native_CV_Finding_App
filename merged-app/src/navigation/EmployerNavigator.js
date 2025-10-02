import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import EmployerHomeScreen from '../screens/employer/EmployerHomeScreen';
import JobPostingScreen from '../screens/employer/JobPostingScreen';
import CandidateListScreen from '../screens/employer/CandidateListScreen';
import NotificationScreen from '../screens/employer/NotificationScreen';
import AccountScreen from '../screens/employer/AccountScreen';
import EmployerTabBar from '../components/employer/EmployerTabBar';

const Tab = createBottomTabNavigator();

export default function EmployerNavigator() {
    const unreadNotifications = 3;

    return (
        <Tab.Navigator 
            tabBar={(props) => <EmployerTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="EmployerHome"
                component={EmployerHomeScreen}
                options={{
                    tabBarLabel: "Trang chủ",
                    tabBarIcon: "home"
                }}
            />
            <Tab.Screen
                name="JobPosting"
                component={JobPostingScreen}
                options={{
                    tabBarLabel: "Tuyển dụng",
                    tabBarIcon: "work"
                }}
            />
            <Tab.Screen
                name="CandidateList"
                component={CandidateListScreen}
                options={{
                    tabBarLabel: "Ứng viên",
                    tabBarIcon: "people"
                }}
            />
            <Tab.Screen
                name="Notification"
                component={NotificationScreen}
                options={{
                    tabBarLabel: "Thông báo",
                    tabBarIcon: "notifications",
                    tabBarBadge: unreadNotifications
                }}
            />
            <Tab.Screen
                name="Account"
                component={AccountScreen}
                options={{
                    tabBarLabel: "Tài khoản",
                    tabBarIcon: "person"
                }}
            />
        </Tab.Navigator>
    );
}