import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function AiSuggestionsModal({
  visible,
  candidates = [],
  onClose,
  onSelectCandidate,
}) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.aiModal}>
        <View style={styles.aiModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.aiModalTitle}>Gợi ý ứng viên nổi bật (AI)</Text>
          <View style={{ width: 22 }} />
        </View>
        <Text style={styles.aiModalHint}>Dựa trên bộ lọc hiện tại của bạn</Text>
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
          {candidates.map((c) => (
            <TouchableOpacity
              key={`ai-${c.id}`}
              style={[styles.card, styles.aiCard]}
              onPress={() => onSelectCandidate && onSelectCandidate(c)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 18 }}>⭐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.title}>{c.title}</Text>
                  <Text style={styles.meta}>{`${(
                    c.level || ""
                  ).toUpperCase()} • ${c.experience || ""} • ${
                    c.location || ""
                  }`}</Text>
                </View>
                <Text style={styles.score}>{Math.round(c.__score || 0)}</Text>
              </View>
              {c.__reasons?.length ? (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.reasonLabel}>Lý do gợi ý:</Text>
                  {c.__reasons.slice(0, 3).map((r, idx) => (
                    <Text key={idx} style={styles.reasonText}>
                      • {r}
                    </Text>
                  ))}
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  aiModal: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  aiModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  aiModalTitle: { fontSize: 18, fontWeight: "800", color: "#333" },
  aiModalHint: {
    fontSize: 12,
    color: "#777",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e8f5e9",
  },
  aiCard: { borderColor: "#e8f5e9", borderWidth: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  name: { fontSize: 16, fontWeight: "700", color: "#333" },
  title: { fontSize: 13, color: "#666", marginTop: 2 },
  meta: { fontSize: 12, color: "#999", marginTop: 4 },
  score: { color: "#00b14f", fontWeight: "800" },
  reasonLabel: { fontSize: 12, color: "#666" },
  reasonText: { fontSize: 12, color: "#555" },
});
