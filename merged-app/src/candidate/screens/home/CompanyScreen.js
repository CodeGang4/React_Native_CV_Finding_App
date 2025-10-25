import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useVerifiedCompanies from "../../../shared/hooks/useVerifiedCompanies";

export default function CompanyScreen() {
  const navigation = useNavigation();
  const { filteredCompanies, loading, error, search } = useVerifiedCompanies();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchPress = async () => {
    setIsSearching(true);
    await search(query.trim());
    setIsSearching(false);
  };

  const renderCompanyCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("CompanyDetail", { company: item })}
    >
      <Image source={{ uri: item.logo }} style={styles.logo} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.industry}>{item.industry}</Text>
        <Text style={styles.address}>{item.address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm công ty..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearchPress}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#00b14f" />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        renderItem={renderCompanyCard}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          !loading && (
            <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              Không tìm thấy công ty nào.
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 10,
    paddingRight: 4,
  },

  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 15,
  },

  searchButton: {
    backgroundColor: "#00b14f",
    borderRadius: 8,
    padding: 10,
    marginLeft: 4,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },

  logo: { width: 50, height: 50, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  industry: { fontSize: 14, color: "#00b14f", marginTop: 2 },
  address: { fontSize: 12, color: "#666", marginTop: 2 },
  error: { color: "red", textAlign: "center", marginVertical: 10 },
});
