import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/ProfileScreen";
import CVScreen from "../screens/CVScreen";
import EditProfile from "../screens/EditProfile";
import CVViewer from "../screens/CVViewer";

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Hồ sơ cá nhân" }}
      />
      <Stack.Screen
        name="CVScreen"
        component={CVScreen}
        options={{ 
          title: "CV của bạn",
          headerShown: true
        }}
      />
      <Stack.Screen 
        name="CVViewer" 
        component={CVViewer} 
        options={{ 
          title: "CV của bạn",
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfile} 
        options={{ 
          title: "Chỉnh sửa hồ sơ",
          headerShown: true
        }} 
      />
    </Stack.Navigator>
  );
}