import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";

export default function CommonHeader({
  title,
  onBack,
  showAI = true,
  backgroundColor = "#00b14f",
}) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        {showAI ? (
          <View style={styles.aiContainer}>
            <View style={[styles.aiBot, { borderColor: backgroundColor }]}>
              <Text style={[styles.aiBotText, { color: backgroundColor }]}>
                AI
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  aiContainer: { position: "relative" },
  aiBot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  aiBotText: { fontWeight: "bold", fontSize: 16 },
  placeholder: { width: 60, height: 60 },
});
