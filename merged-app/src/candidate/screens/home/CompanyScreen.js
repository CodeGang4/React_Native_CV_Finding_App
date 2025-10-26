import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useVerifiedCompanies from "../../../shared/hooks/useVerifiedCompanies";
import CompanyCard from "../../components/CompanyCard";

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

      {loading && <ActivityIndicator size="large" color="#00b14f" style={styles.loading} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CompanyCard company={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              Không tìm thấy công ty nào.
            </Text>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 16 
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 16,
    paddingRight: 4,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#00b14f",
    borderRadius: 8,
    padding: 10,
    marginLeft: 4,
  },
  loading: {
    marginTop: 20,
  },
  error: { 
    color: "red", 
    textAlign: "center", 
    marginVertical: 10,
    fontSize: 16,
  },
  listContainer: { 
    paddingBottom: 20 
  },
  emptyText: { 
    textAlign: "center", 
    color: "#666", 
    marginTop: 40,
    fontSize: 16,
  },
});