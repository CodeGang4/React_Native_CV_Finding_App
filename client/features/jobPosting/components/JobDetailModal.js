// import React from "react";
// import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

// export default function JobDetailModal({ visible, job, onClose }) {
//   if (!visible || !job) return null;
//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.card}>
//           <Text style={styles.title}>{job.title}</Text>
//           <Text style={styles.meta}>
//             {job.salary} • {job.location}
//           </Text>
//           {job.description ? (
//             <Text style={styles.description} numberOfLines={6}>
//               {job.description}
//             </Text>
//           ) : null}
//           <TouchableOpacity onPress={onClose} style={styles.button}>
//             <Text style={styles.buttonText}>Đóng</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   card: {
//     width: "90%",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//   },
//   title: { fontSize: 16, fontWeight: "700", color: "#333" },
//   meta: { fontSize: 12, color: "#666", marginTop: 4 },
//   description: { fontSize: 13, color: "#444", marginTop: 12 },
//   button: {
//     marginTop: 16,
//     backgroundColor: "#00b14f",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "600" },
// });
