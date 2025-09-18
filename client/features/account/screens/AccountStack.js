import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import EmployerAccountPage from "./EmployerAccountPage";
import CandidateDetailScreen from "../../../shared/screens/CandidateDetailScreen";

const Stack = createStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountMain" component={EmployerAccountPage} />
      <Stack.Screen name="CandidateDetail" component={CandidateDetailScreen} />
    </Stack.Navigator>
  );
}
