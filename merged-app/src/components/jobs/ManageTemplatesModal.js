import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";

export default function ManageTemplatesModal({ 
  visible, 
  onClose, 
  templates = [], 
  onCreate, 
  onUpload 
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Quản lý mẫu email</Text>
          <Text style={styles.placeholder}>Tính năng đang được phát triển</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  placeholder: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});