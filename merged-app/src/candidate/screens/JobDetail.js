import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import Icon from "react-native-vector-icons/Ionicons";
const API_BASE = Constants.expoConfig.extra.API;

export default function JobDetailScreen({ route }) {
  const { job } = route.params;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${API_BASE}/employer/getCompanyInfo/${job.employer_id}`);
        const data = await res.json();
        setCompany(data);
      } catch (err) {
        console.error("Error fetching company info:", err);
        Alert.alert("Lỗi", "Không thể tải thông tin công ty");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [job.employer_id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00b14f" />
      </View>
    );
  }

  const openMap = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.companyContainer}>
        {company?.company_logo ? (
          <Image
            source={{ uri: company.company_logo }}
            style={styles.companyLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.companyLogo, styles.placeholderLogo]}>
            <Text style={{ color: "#888" }}>No Logo</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.companyName}>{company?.company_name || "Không rõ công ty"}</Text>

          <TouchableOpacity
            onPress={() => openMap(company?.company_address)}
            style={styles.inlineRow}
          >
            <Icon name="location-outline" size={16} color="#00b14f" />
            <Text style={styles.companyAddress}>
              {company?.company_address || "Không rõ địa chỉ"}
            </Text>
          </TouchableOpacity>

          {company?.company_website && (
            <TouchableOpacity
              onPress={() => Linking.openURL(company.company_website)}
              style={styles.inlineRow}
            >
              <Icon name="globe-outline" size={16} color="#007bff" />
              <Text style={styles.companyWebsite}>
                {company.company_website.replace(/^https?:\/\//, "")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.salary}>
          {job.salary || "Thỏa thuận"}
        </Text>

        <View style={styles.inlineRow}>
          <Icon name="briefcase-outline" size={16} color="#555" />
          <Text style={styles.position}>{job.position}</Text>
        </View>

        <View style={styles.inlineRow}>
          <Icon name="school-outline" size={16} color="#555" />
          <Text style={styles.education}>{job.education}</Text>
        </View>

        <View style={styles.inlineRow}>
          <Icon name="people-outline" size={16} color="#555" />
          <Text style={styles.quantity}>Số lượng: {job.quantity}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mô tả công việc</Text>
        <Text style={styles.text}>{job.description}</Text>
      </View>

      {Array.isArray(job.requirements) && job.requirements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yêu cầu ứng viên</Text>
          {job.requirements.map((req, index) => (
            <Text key={index} style={styles.text}>
              • {req}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hạn nộp hồ sơ</Text>
        <Text style={styles.text}>
          {new Date(job.expired_date).toLocaleDateString("vi-VN")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  inlineRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  companyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f6f0",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  companyLogo: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  placeholderLogo: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  companyName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  companyAddress: { fontSize: 14, color: "#555", marginLeft: 4 },
  companyWebsite: {
    fontSize: 14,
    color: "#007bff",
    marginLeft: 4,
    textDecorationLine: "underline",
  },
  section: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  jobTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#111" },
  salary: { fontSize: 16, color: "#00b14f", marginBottom: 6 },
  position: { fontSize: 15, color: "#444", marginLeft: 6 },
  education: { fontSize: 15, color: "#444", marginLeft: 6 },
  quantity: { fontSize: 15, color: "#444", marginLeft: 6 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  text: { fontSize: 15, color: "#333", lineHeight: 22 },
});
