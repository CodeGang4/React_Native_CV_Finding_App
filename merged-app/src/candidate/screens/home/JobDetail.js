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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import HomeApiService from "../../../shared/services/api/HomeApiService";
// import CandidateApiService from "../../../shared/services/api/CandidateApiService";
import { useAuth } from "../../../shared/contexts/AuthContext";
import useSavedJobs from "../../../shared/hooks/useSavedJobs";
import useApplications from "../../../shared/hooks/useApplications";

export default function JobDetailScreen({ route }) {
  const { job } = route.params;
  const { user } = useAuth();
  const { savedJobs, toggleSaveJob, fetchSavedJobs } = useSavedJobs();
  const { applications, getApplicationsByCandidate, applyToJob } =
    useApplications();

  const insets = useSafeAreaInsets();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const isSaved = savedJobs?.includes(job.id);

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyData = await HomeApiService.getCompanyByEmployerId(
          job.employer_id
        );
        setCompany(companyData);

        await fetchSavedJobs();

        if (user?.id) {
          const userApplications = await getApplicationsByCandidate(user.id);
          const applied = userApplications.some((app) => app.job_id === job.id);
          setHasApplied(applied);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
        setCompany({
          company_name: "Không rõ công ty",
          company_logo: null,
          company_address: "Không rõ địa chỉ",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [job?.employer_id, job.id, user?.id]);

  const openMap = (address) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(url);
  };

  const handleApplyPress = async () => {
    if (!user?.id) {
      Alert.alert(
        "Thông báo",
        "Vui lòng đăng nhập để ứng tuyển công việc này."
      );
      return;
    }

    if (hasApplied) {
      Alert.alert("Thông báo", "Bạn đã ứng tuyển công việc này rồi!");
      return;
    }

    try {
      setApplying(true);
      await applyToJob(user.id, job.id);
      setHasApplied(true);
      Alert.alert("Thành công", "Bạn đã ứng tuyển công việc này!");
    } catch (error) {
      console.error("Error applying job:", error);
      Alert.alert("Lỗi", "Không thể ứng tuyển. Vui lòng thử lại sau.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00b14f" />
      </View>
    );
  }

  const bottomBarHeight = 60 + Math.max(insets.bottom, 16);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomBarHeight }}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.companyName}>{company?.company_name}</Text>

            <TouchableOpacity
              onPress={() => openMap(company?.company_address)}
              style={styles.inlineRow}
            >
              <Icon name="location-outline" size={16} color="#00b14f" />
              <Text style={styles.companyAddress}>
                {company?.company_address || "Không rõ địa chỉ"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.salary}>{job.salary || "Thỏa thuận"}</Text>

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

          {hasApplied && (
            <View style={styles.appliedBadge}>
              <Icon name="checkmark-circle" size={16} color="#00b14f" />
              <Text style={styles.appliedText}>Đã ứng tuyển</Text>
            </View>
          )}
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

      <View
        style={[
          styles.bottomBar,
          {
            height: bottomBarHeight,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => toggleSaveJob(job.id)}
        >
          <Icon
            name={isSaved ? "heart" : "heart-outline"}
            size={24}
            color={isSaved ? "#ff4d4f" : "#00b14f"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.applyButton, hasApplied && styles.applyButtonDisabled]}
          onPress={handleApplyPress}
          disabled={applying || hasApplied}
        >
          {applying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[styles.applyText, hasApplied && styles.applyTextDisabled]}
            >
              {hasApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  inlineRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  companyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f6f0",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  companyAddress: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
    flex: 1,
  },
  section: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  jobTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111",
  },
  salary: {
    fontSize: 16,
    color: "#00b14f",
    marginBottom: 6,
    fontWeight: "600",
  },
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
  appliedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f6f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  appliedText: {
    fontSize: 14,
    color: "#00b14f",
    fontWeight: "500",
    marginLeft: 4,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  applyButton: {
    flex: 1,
    height: 50,
    marginLeft: 12,
    backgroundColor: "#00b14f",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  applyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  applyTextDisabled: {
    color: "#888888",
  },
});
