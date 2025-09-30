/**
 * Main App Component
 * Updated to use new architecture structure
 */
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import EmployerTabNavigator from "./ui/navigation/EmployerTabNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <EmployerTabNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
