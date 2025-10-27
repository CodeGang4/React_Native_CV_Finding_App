import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import useVerifiedCompanies from "../../shared/hooks/useVerifiedCompanies";
import CompanyCard from "./CompanyCard";

export default function CompanyListSection({ limit = 2 }) {
  const { filteredCompanies, loading, error } = useVerifiedCompanies();

  const limitedCompanies = limit ? filteredCompanies.slice(0, limit) : filteredCompanies;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#00b14f" />
        <Text style={styles.loadingText}>Đang tải công ty...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={limitedCompanies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CompanyCard company={item} />}
        contentContainerStyle={styles.listContainer}
        nestedScrollEnabled={true}
        scrollEnabled={false}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              Không tìm thấy công ty nào.
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContainer: {
    paddingBottom: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
    fontSize: 14,
  },
});