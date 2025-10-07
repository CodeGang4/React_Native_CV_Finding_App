import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native";

import CandidateHomeScreen from "../screens/CandidateHomeScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import InterviewPracticeScreen from "../screens/InterviewPracticeScreen";
import ProfileStackNavigator from "./ProfileStackNavigator";
import { useAuth } from "../../shared/contexts/AuthContext";

const Tab = createBottomTabNavigator();

export default function CandidateNavigator() {
  const { user } = useAuth();

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

        // tabBarStyle: {
        //   paddingHorizontal: 10,
        // },
      })}
    >
      <Tab.Screen
        name="CandidateHome"
        component={CandidateHomeScreen}
        options={{ title: "Trang chủ" }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Thông báo" }}
      />
      <Tab.Screen
        name="InterviewPractice"
        component={InterviewPracticeScreen}
        options={{ title: "Luyện phỏng vấn" }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={{ title: "Hồ sơ" }}
      />
    </Tab.Navigator>
  );
}
