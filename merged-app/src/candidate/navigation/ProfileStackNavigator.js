import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import CVScreen from "../screens/profile/CVScreen";
import EditProfile from "../screens/profile/EditProfile";
import CVViewer from "../screens/profile/CVViewer";
import AppliedJobs from "../screens/profile/AppliedJobs";
import SaveJobs from "../screens/profile/SaveJobs";
import JobDetailScreen from "../screens/home/JobDetail";

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
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="CVViewer"
        component={CVViewer}
        options={{
          title: "CV của bạn",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          title: "Chỉnh sửa hồ sơ",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="AppliedJobs"
        component={AppliedJobs}
        options={{ title: "Việc làm đã ứng tuyển", headerShown: true }}
      />
      <Stack.Screen
        name="SaveJobs"
        component={SaveJobs}
        options={{ title: "Việc làm đã lưu", headerShown: true }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: "Chi tiết công việc" }}
      />
    </Stack.Navigator>
  );
}
