import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CandidateHomeScreen from "../screens/home/CandidateHomeScreen";
import JobDetailScreen from "../screens/home/JobDetail";
import JobSearchScreen from "../screens/home/JobSearchScreen";
import CVScreen from "../screens/profile/CVScreen";
import CVViewer from "../screens/profile/CVViewer";
import CompanyScreen from "../screens/home/CompanyScreen";
import CompanyDetail from "../screens/home/CompanyDetail";
import Podcast from "../screens/home/Podcast";

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
      <Stack.Screen
        name="CVScreen"
        component={CVScreen}
        options={{ title: "CV của bạn" }}
      />
      <Stack.Screen
        name="CVViewer"
        component={CVViewer}
        options={{ title: "CV của bạn" }}
      />
      <Stack.Screen
        name="CompanyScreen"
        component={CompanyScreen}
        options={{ title: "Danh sách công ty" }}
      />
      <Stack.Screen
        name="CompanyDetail"
        component={CompanyDetail}
        options={{ title: "Chi tiết công ty" }}
      />
      <Stack.Screen
        name="Podcast"
        component={Podcast}
        options={{ title: "Podcast dành cho bạn" }}
      />
    </Stack.Navigator>
  );
}
