import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ConnectScreen from "./ConnectScreen";
import CandidateDetailScreen from "../shared/CandidateDetailScreen";

const Stack = createStackNavigator();

export default function ConnectStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConnectMain" component={ConnectScreen} />
      <Stack.Screen name="CandidateDetail" component={CandidateDetailScreen} />
    </Stack.Navigator>
  );
}
