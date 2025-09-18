import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../features/home/screens/HomeScreen";
import AccountStack from "../features/account/screens/AccountStack";
import NotificationScreen from "../features/notifications/screens/NotificationScreen";
import ConnectStack from "../features/connect/screens/ConnectStack";
import JobPostingScreen from "../features/jobPosting/screens/JobPostingScreen";
import EmployerTabBar from "../shared/components/ui/TabBar/EmployerTabBar";

const Tab = createBottomTabNavigator();

export default function EmployerTabNavigator() {
  const unreadNotifications = 3;

  return (
    <Tab.Navigator tabBar={(props) => <EmployerTabBar {...props} />}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, tabBarLabel: "Trang chủ" }}
      />
      <Tab.Screen
        name="JobPosting"
        component={JobPostingScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Tuyển dụng",
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectStack}
        options={{
          headerShown: false,
          tabBarLabel: "Ứng viên",
        }}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          headerShown: false,
          tabBarLabel: "Thông báo",
          tabBarBadge: unreadNotifications,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{ headerShown: false, tabBarLabel: "Tài khoản" }}
      />
    </Tab.Navigator>
  );
}
