import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert } from "react-native";

export default function JobDetailScreen({ route }) {
  const { job } = route.params || {};
  const [jobDetail, setJobDetail] = useState(job || null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!job || !job.id) return;
        const res = await fetch(`http://192.168.1.3:3000/job/getJobDetail/${job.id}`);
        const data = await res.json();
        setJobDetail(data);

        const companyRes = await fetch(`http://192.168.1.3:3000/employer/getCompanyInfo/${data.employer_id}`);
        const companyData = await companyRes.json();
        setCompany(companyData);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết công việc:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [job]);

  const openInMaps = (address) => {
    if (!address) {
      Alert.alert("Không có địa chỉ cụ thể");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Không thể mở Google Maps");
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00b14f" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!jobDetail) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy thông tin công việc</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{jobDetail.title}</Text>

      <TouchableOpacity onPress={() => openInMaps(jobDetail.location)}>
        <Text style={styles.company}>
          {company?.company_name || "Không rõ công ty"} •{" "}
          <Text style={styles.locationLink}>{jobDetail.location}</Text>
        </Text>
      </TouchableOpacity>

      <Text style={styles.salary}>{jobDetail.salary}</Text>

      <Text style={styles.sectionTitle}>Mô tả công việc</Text>
      <Text style={styles.paragraph}>
        {jobDetail.description || "Không có mô tả chi tiết."}
      </Text>

      <Text style={styles.sectionTitle}>Yêu cầu</Text>
      <Text style={styles.paragraph}>
        {jobDetail.requirements || "Không có yêu cầu cụ thể."}
      </Text>

      <Text style={styles.sectionTitle}>Liên hệ</Text>
      <Text style={styles.paragraph}>
        Gửi CV về: {company?.contact_person || "hr@example.com"}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  company: { fontSize: 14, color: "#666", marginBottom: 6 },
  salary: { fontSize: 16, color: "#1a73e8", marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  paragraph: { fontSize: 14, color: "#333", lineHeight: 20, marginBottom: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  locationLink: { color: "#00b14f", textDecorationLine: "underline" },
});
