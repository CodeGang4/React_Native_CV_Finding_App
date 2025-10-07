import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/ProfileScreen";
import ListCV from "../screens/ListCV";
import CV from "../screens/CV";
import EditProfile from "../screens/EditProfile";

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
        name="ListCV"
        component={ListCV}
        options={{ title: "Danh sách CV" }}
      />
      <Stack.Screen 
        name="CV" 
        component={CV} 
        options={{ title: "CV của bạn" }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfile} 
        options={{ title: "Chỉnh sửa hồ sơ" }} 
      />
    </Stack.Navigator>
  );
}
