import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CandidateHomeScreen from "../screens/CandidateHomeScreen";
import JobDetailScreen from "../screens/JobDetail";

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
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: "Chi tiết công việc" }}
      />
    </Stack.Navigator>
  );
}
