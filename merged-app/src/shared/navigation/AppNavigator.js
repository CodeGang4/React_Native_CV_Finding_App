import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../screens/auth/LoadingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import RoleSelectionScreen from "../screens/auth/RoleSelectionScreen";
import CandidateNavigator from "../../candidate/navigation/CandidateNavigator";
import EmployerTabNavigator from "../../employer/navigation/EmployerTabNavigator";
import linking from "../services/DeepLinkService";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer 
      linking={linking}
      fallback={<LoadingScreen />}
      onReady={() => {
        console.log(' Navigation ready with deep linking');
      }}
      onStateChange={(state) => {
        // Log navigation state changes for debugging
        if (__DEV__) {
          console.log('📍 Navigation state changed');
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen
              name="RoleSelection"
              component={RoleSelectionScreen}
            />
          </>
        ) : userRole === "candidate" ? (
          // Candidate app
          <Stack.Screen name="CandidateApp" component={CandidateNavigator} />
        ) : userRole === "employer" ? (
          // Employer app
          <Stack.Screen name="EmployerApp" component={EmployerTabNavigator} />
        ) : (
          // Fallback to role selection if role is undefined
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
