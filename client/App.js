import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import MainTabNavigator from "./navigation/MainTabNavigator";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#00b14f" />
      <NavigationContainer>
        <MainTabNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
