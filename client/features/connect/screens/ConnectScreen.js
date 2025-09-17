import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ConnectScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
