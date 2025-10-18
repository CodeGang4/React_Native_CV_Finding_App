import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function SearchFiltersBar({
  q,
  onChangeQ,
  level,
  onChangeLevel,
  allSkills = [],
  selectedSkills = [],
  onToggleSkill,
  onOpenAi,
  onOpenAIInsights,
  onOpenAISettings,
  containerStyle,
}) {
  return (
    <View style={[styles.searchCard, containerStyle]}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm ứng viên theo tên, vị trí, địa điểm..."
        value={q}
        onChangeText={onChangeQ}
        returnKeyType="search"
      />

      <View style={styles.levelRow}>
        {[
          { k: "all", label: "Tất cả" },
          { k: "junior", label: "Junior" },
          { k: "mid", label: "Mid" },
          { k: "senior", label: "Senior" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.k}
            onPress={() => onChangeLevel && onChangeLevel(opt.k)}
            style={[styles.levelChip, level === opt.k && styles.levelChipOn]}
          >
            <Text
              style={[
                styles.levelChipText,
                level === opt.k && styles.levelChipTextOn,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.skillsRow}>
          {allSkills.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => onToggleSkill && onToggleSkill(s)}
              style={[
                styles.skillChip,
                selectedSkills.includes(s) && styles.skillOn,
              ]}
            >
              <Text
                style={[
                  styles.skillText,
                  selectedSkills.includes(s) && styles.skillTextOn,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.aiRow}>
        <View style={styles.aiButtonsContainer}>
          <TouchableOpacity
            style={styles.aiInsightsButton}
            onPress={onOpenAIInsights}
          >
            <MaterialIcons name="psychology" size={18} color="#4CAF50" />
            <Text style={styles.aiInsightsButtonText}>
              AI phân tích ứng viên nổi bật
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.aiSettingsButton}
            onPress={onOpenAISettings}
          >
            <MaterialIcons name="settings" size={16} color="#2196F3" />
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
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
  levelRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  levelChipOn: { backgroundColor: "#00b14f", borderColor: "#00b14f" },
  levelChipText: { fontSize: 12, color: "#555", fontWeight: "500" },
  levelChipTextOn: { color: "#fff" },
  skillsRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  aiRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  aiButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00b14f",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  aiButtonText: { color: "#fff", fontWeight: "700", marginLeft: 6 },
  aiInsightsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  aiInsightsButtonText: {
    color: "#4CAF50",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 12,
  },
  aiSettingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  aiHint: { fontSize: 12, color: "#777", flex: 1, textAlign: "right" },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  skillOn: { backgroundColor: "#e8f5e9", borderColor: "#c8e6c9" },
  skillText: { fontSize: 12, color: "#555", fontWeight: "500" },
  skillTextOn: { color: "#2e7d32" },
});
