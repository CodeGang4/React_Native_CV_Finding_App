import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import EmployerAccountPage from "./EmployerAccountPage";
import CandidateDetailScreen from "../shared/CandidateDetailScreen";
import EmployerUpgradeAccount from "./EmployerUpgradeAccount";
import EmployerNativePaymentScreen from "./EmployerNativePaymentScreen";
import EmployerPaymentSuccessScreen from "./EmployerPaymentSuccessScreen";
import EmployerPaymentHistoryScreen from "./EmployerPaymentHistoryScreen";
import AdvancedAnalyticsScreen from "../analytics/AdvancedAnalyticsScreen";

const Stack = createStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountMain" component={EmployerAccountPage} />
      <Stack.Screen name="CandidateDetail" component={CandidateDetailScreen} />
      <Stack.Screen name="EmployerUpgradeAccount" component={EmployerUpgradeAccount} />
      <Stack.Screen name="EmployerNativePayment" component={EmployerNativePaymentScreen} />
      <Stack.Screen name="EmployerPaymentSuccess" component={EmployerPaymentSuccessScreen} />
      <Stack.Screen name="EmployerPaymentHistory" component={EmployerPaymentHistoryScreen} />
      <Stack.Screen name="AdvancedAnalytics" component={AdvancedAnalyticsScreen} />
    </Stack.Navigator>
  );
}
