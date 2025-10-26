import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ConnectScreen from "./ConnectScreen";
import CandidateDetailScreen from "../shared/CandidateDetailScreen";
import EmployerUpgradeAccount from "../account/EmployerUpgradeAccount";
import EmployerNativePaymentScreen from "../account/EmployerNativePaymentScreen";
import EmployerPaymentSuccessScreen from "../account/EmployerPaymentSuccessScreen";
import EmployerPaymentHistoryScreen from "../account/EmployerPaymentHistoryScreen";

const Stack = createStackNavigator();

export default function ConnectStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConnectMain" component={ConnectScreen} />
      <Stack.Screen name="CandidateDetail" component={CandidateDetailScreen} />
      <Stack.Screen name="EmployerUpgradeAccount" component={EmployerUpgradeAccount} />
      <Stack.Screen name="EmployerNativePayment" component={EmployerNativePaymentScreen} />
      <Stack.Screen name="EmployerPaymentSuccess" component={EmployerPaymentSuccessScreen} />
      <Stack.Screen name="EmployerPaymentHistory" component={EmployerPaymentHistoryScreen} />
    </Stack.Navigator>
  );
}
