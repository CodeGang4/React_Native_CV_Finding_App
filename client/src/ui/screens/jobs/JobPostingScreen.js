import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import JobPostingPage from "./jobPosting/JobPostingPage";
import JobDetailPage from "./jobPosting/JobDetailPage";
import CandidateDetailScreen from "../shared/CandidateDetailScreen";

const Stack = createStackNavigator();

export default function JobPostingScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobPostingMain" component={JobPostingPage} />
      <Stack.Screen name="JobDetail" component={JobDetailPage} />
      <Stack.Screen name="CandidateDetail" component={CandidateDetailScreen} />
    </Stack.Navigator>
  );
}
