import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Component để hiển thị thông tin đầy đủ khi nhấn vào
export default function ExpandableJobStat({
  icon,
  value,
  fullValue,
  label,
  maxLines = 2,
}) {
  const [showModal, setShowModal] = useState(false);

  const needsExpansion = fullValue && fullValue.length > 20;

  const handlePress = () => {
    if (needsExpansion) {
      setShowModal(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.statItem}
        onPress={handlePress}
        disabled={!needsExpansion}
      >
        <MaterialIcons
          name={icon}
          size={18}
          color="#fff"
          style={styles.statIcon}
        />
        <View style={styles.statTextContainer}>
          <Text
            style={styles.statValue}
            numberOfLines={maxLines}
            ellipsizeMode="tail"
          >
            {value || "—"}
          </Text>
          {needsExpansion && (
            <MaterialIcons
              name="info-outline"
              size={14}
              color="rgba(255,255,255,0.7)"
              style={styles.infoIcon}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Modal hiển thị thông tin đầy đủ */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name={icon} size={24} color="#4CAF50" />
              <Text style={styles.modalLabel}>{label}</Text>
            </View>
            <Text style={styles.modalValue}>{fullValue}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  statItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    minWidth: 80,
    maxWidth: 120,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  statIcon: {
    marginTop: 2,
    opacity: 0.9,
  },
  statTextContainer: {
    flex: 1,
    marginLeft: 6,
  },
  statValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16,
  },
  infoIcon: {
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxWidth: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  modalValue: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
