import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

import NotificationsScreen from "../screens/NotificationsScreen";
import InterviewPracticeScreen from "../screens/InterviewPracticeScreen";
import ProfileStackNavigator from "./ProfileStackNavigator";
import CandidateStackNavigator from "./CandidateStackNavigator";
import { useAuth } from "../../shared/contexts/AuthContext";
import { useNotifications } from "../../shared/contexts/NotificationContext";

const Tab = createBottomTabNavigator();

export default function CandidateNavigator() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      initialRouteName="CandidateHome"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "ProfileStack" && user?.avatarUrl) {
            return (
              <Image
                source={{ uri: user.avatarUrl }}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 2,
                  borderColor: color,
                }}
              />
            );
          }

          let iconName;
          if (route.name === "CandidateHome") iconName = "home";
          else if (route.name === "Notifications") iconName = "notifications";
          else if (route.name === "InterviewPractice") iconName = "question-answer";
          else iconName = "person";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#00b14f",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="CandidateHome"
        component={CandidateStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "CandidateHomeMain";

          const display = routeName === "CandidateHomeMain" ? "flex" : "none";
          return {
            title: "Trang chủ",
            tabBarStyle: { display },
          };
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Thông báo",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      
      <Tab.Screen
        name="InterviewPractice"
        component={InterviewPracticeScreen}
        options={{ title: "Luyện phỏng vấn" }}
      />
      
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Profile';
          
          const hideBottomTabRoutes = ['CVScreen', 'CVViewer', 'EditProfile'];
          const display = hideBottomTabRoutes.includes(routeName) ? 'none' : 'flex';
          
          return {
            title: "Hồ sơ",
            tabBarStyle: { display },
          };
        }}
      />
    </Tab.Navigator>
  );
}