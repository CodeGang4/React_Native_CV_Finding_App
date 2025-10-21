import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CandidateHomeScreen from "../screens/home/CandidateHomeScreen";
import JobDetailScreen from "../screens/home/JobDetail";
import JobSearchScreen from "../screens/home/JobSearchScreen";

const Stack = createStackNavigator();

export default function CandidateStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CandidateHomeMain"
        component={CandidateHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="JobSearchScreen"
        component={JobSearchScreen}
        options={{ title: "Tìm kiếm việc làm" }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: "Chi tiết công việc" }}
      />
    </Stack.Navigator>
  );
}
