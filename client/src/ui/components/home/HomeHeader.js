import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function HomeHeader({ search, setSearch }) {
  const roundButtons = [
    { title: "Việc làm", icon: "work", type: "MaterialIcons" },
    { title: "Công ty", icon: "business", type: "MaterialIcons" },
    { title: "Podcast", icon: "radio", type: "MaterialIcons" },
    { title: "Blog", icon: "article", type: "MaterialIcons" },
    { title: "Công cụ", icon: "build", type: "MaterialIcons" },
  ];

  const renderIcon = (iconName, type) => {
    switch (type) {
      case "MaterialIcons":
        return <MaterialIcons name={iconName} size={24} color="white" />;
      case "Ionicons":
        return <Ionicons name={iconName} size={24} color="white" />;
      case "FontAwesome5":
        return <FontAwesome5 name={iconName} size={24} color="white" />;
      default:
        return <MaterialIcons name={iconName} size={24} color="white" />;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#00b14f" />
      <LinearGradient
        colors={["#00b14f", "#4CAF50"]}
        style={styles.headerContainer}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo địa điểm"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
        </View>

        {/* Round Buttons */}
        <View style={styles.roundButtonsContainer}>
          {roundButtons.map((button, index) => (
            <TouchableOpacity key={index} style={styles.roundButton}>
              <View style={styles.roundButtonIcon}>
                {renderIcon(button.icon, button.type)}
              </View>
              <Text style={styles.roundButtonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggest Button */}
        <TouchableOpacity style={styles.suggestButton}>
          <MaterialIcons name="explore" size={20} color="#00b14f" />
          <Text style={styles.suggestButtonText}>
            Khám phá việc làm gần bạn
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 44,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  logoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  roundButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  roundButton: {
    alignItems: "center",
    flex: 1,
  },
  roundButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  roundButtonText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  suggestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "stretch",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestButtonText: {
    color: "#00b14f",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
