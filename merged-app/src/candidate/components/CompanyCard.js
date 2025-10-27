import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CompanyCard = ({ company }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("CompanyDetail", { company });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
    >
      <Image source={{ uri: company.logo }} style={styles.logo} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{company.name}</Text>
        <Text style={styles.industry}>{company.industry}</Text>
        <Text style={styles.address}>{company.address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  logo: { 
    width: 50, 
    height: 50, 
    marginRight: 12,
    borderRadius: 8,
  },
  name: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#333" 
  },
  industry: { 
    fontSize: 14, 
    color: "#00b14f", 
    marginTop: 2 
  },
  address: { 
    fontSize: 12, 
    color: "#666", 
    marginTop: 2 
  },
});

export default CompanyCard;