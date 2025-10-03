import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function CandidatePreviewSheet({
  selected,
  aiSimilar = [],
  onClose,
  onInvite,
  onSelectCandidate,
}) {
  return (
    <Modal visible={!!selected} transparent animationType="slide">
      <View style={styles.sheetOverlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{selected?.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetSubtitle}>{selected?.title}</Text>
          <Text style={styles.sheetMeta}>{`${
            selected?.level?.toUpperCase?.() || ""
          } • ${selected?.experience || ""} • ${
            selected?.location || ""
          }`}</Text>
          <View style={styles.sheetSkills}>
            {(selected?.skills || []).map((s) => (
              <View key={s} style={styles.cardSkillTag}>
                <Text style={styles.cardSkillText}>{s}</Text>
              </View>
            ))}
          </View>
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <MaterialIcons name="bookmark" size={18} color="#00b14f" />
              <Text style={styles.actionBtnText}>Lưu hồ sơ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onInvite}>
              <MaterialIcons name="email" size={18} color="#2196F3" />
              <Text style={styles.actionBtnText}>Mời phỏng vấn</Text>
            </TouchableOpacity>
          </View>

          {aiSimilar.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.similarTitle}>Ứng viên tương tự</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {aiSimilar.map((c) => (
                    <TouchableOpacity
                      key={`sim-${c.id}`}
                      style={styles.similarCard}
                      onPress={() => onSelectCandidate && onSelectCandidate(c)}
                    >
                      <Text style={styles.similarName}>{c.name}</Text>
                      <Text style={styles.similarMeta}>{c.title}</Text>
                      {c.__overlap?.length ? (
                        <Text style={styles.similarOverlap}>
                          Chung: {c.__overlap.join(", ")}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  sheetSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  sheetMeta: { fontSize: 12, color: "#999", marginTop: 4 },
  sheetSkills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  cardSkillTag: {
    backgroundColor: "#f4f6f8",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardSkillText: { fontSize: 12, color: "#555" },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: 16 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f4f6f8",
    borderRadius: 10,
  },
  actionBtnText: { marginLeft: 6, color: "#333", fontWeight: "600" },
  similarTitle: { fontWeight: "700", color: "#333" },
  similarCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#eef2f3",
  },
  similarName: { fontWeight: "700", color: "#333" },
  similarMeta: { color: "#666", marginTop: 2 },
  similarOverlap: { color: "#777", marginTop: 4 },
});
