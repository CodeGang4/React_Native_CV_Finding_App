import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";

export default function JobFiltersBar({
  searchText,
  onChangeSearch,
  status,
  onChangeStatus,
}) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm theo tiêu đề, công ty, địa điểm..."
        value={searchText}
        onChangeText={onChangeSearch}
        returnKeyType="search"
      />
      <View style={styles.chipsRow}>
        <FilterChip
          label="Tất cả"
          active={status === "all"}
          onPress={() => onChangeStatus("all")}
        />
        <FilterChip
          label="Đang tuyển"
          active={status === "active"}
          onPress={() => onChangeStatus("active")}
        />
        <FilterChip
          label="Hết hạn"
          active={status === "expired"}
          onPress={() => onChangeStatus("expired")}
        />
      </View>
    </View>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#00b14f",
    borderColor: "#00b14f",
  },
  chipText: { fontSize: 12, color: "#555", fontWeight: "500" },
  chipTextActive: { color: "#fff" },
});
