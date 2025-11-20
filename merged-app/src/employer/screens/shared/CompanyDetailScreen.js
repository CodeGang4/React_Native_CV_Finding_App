import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import CommonHeader from "../../components/common/CommonHeader";
import { TAB_BAR_PADDING } from "../../../shared/styles/layout";
import HomeApiService from "../../../shared/services/api/HomeApiService";

const CompanyDetailScreen = ({ company, onBack }) => {
  const [companyDetail, setCompanyDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  const fetchCompanyDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = company.id || company.company_id || company.employer_id || company.user_id;

      console.log('[CompanyDetail] Attempting to fetch with ID:', companyId);
      console.log('[CompanyDetail] Company object:', {
        id: company.id,
        company_id: company.company_id,
        employer_id: company.employer_id,
        user_id: company.user_id
      });

      // Validate company ID before fetching
      if (!companyId || companyId === 'undefined' || companyId === null) {
        throw new Error('Invalid company ID');
      }

      // Fetch company details
      const companyData = await HomeApiService.getCompanyByEmployerId(
        companyId
      );
      setCompanyDetail(companyData);

      // Fetch company jobs if available
      try {
        const companyJobs = await HomeApiService.getJobsByCompanyId(
          companyId
        );
        setJobs(companyJobs || []);
      } catch (jobsError) {
        console.log("[CompanyDetail] Jobs fetch error:", jobsError);
        setJobs([]);
      }
    } catch (err) {
      console.error("[CompanyDetail] Fetch error:", err);
      setError(err.message || "Không thể tải thông tin công ty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company) {
      fetchCompanyDetail();
    }
  }, [company]);

  const handleBackPress = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    }
  };

  const handleFollowPress = () => {
    Alert.alert("Theo dõi", "Chức năng theo dõi công ty sẽ được cập nhật sau");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CommonHeader
          title="Thông tin công ty"
          onBack={handleBackPress}
          showAI={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b14f" />
          <Text style={styles.loadingText}>Đang tải thông tin công ty...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <CommonHeader
          title="Thông tin công ty"
          onBack={handleBackPress}
          showAI={false}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchCompanyDetail()}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayCompany = companyDetail || company;

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Thông tin công ty"
        onBack={handleBackPress}
        showAI={false}
      />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={TAB_BAR_PADDING}
      >
        {/* Company Header */}
        <View style={styles.companyHeader}>
          {/* Logo công ty */}
          <View style={styles.logoSection}>
            {displayCompany.company_logo ? (
              <Image
                source={{ uri: displayCompany.company_logo }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  {(displayCompany.company_name || displayCompany.name || "C")
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Tên công ty */}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {displayCompany.company_name || displayCompany.name}
            </Text>
            <Text style={styles.companyCategory}>
              {displayCompany.industry ||
                displayCompany.category ||
                "Chưa có thông tin ngành"}
            </Text>
          </View>

          {/* Follow Button */}
          <TouchableOpacity
            style={styles.followButton}
            onPress={handleFollowPress}
          >
            <Text style={styles.followButtonText}>+ Theo dõi</Text>
          </TouchableOpacity>
        </View>

        {/* Company Statistics - Only show jobs count
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{jobs.length}</Text>
            <Text style={styles.statLabel}>Việc làm đang tuyển</Text>
          </View>
        </View> */}

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Thông tin công ty</Text>

          <View style={styles.infoGrid}>
            {/* Quy mô */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>👥</Text>
              <Text style={styles.infoCardTitle}>Quy mô</Text>
              <Text style={styles.infoCardValue}>
                {displayCompany.company_size || displayCompany.employees_count
                  ? `${
                      displayCompany.company_size ||
                      displayCompany.employees_count
                    } nhân viên`
                  : "Chưa có thông tin"}
              </Text>
            </View>

            {/* Ngành */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>🏢</Text>
              <Text style={styles.infoCardTitle}>Ngành</Text>
              <Text style={styles.infoCardValue}>
                {displayCompany.industry ||
                  displayCompany.category ||
                  "Chưa có thông tin"}
              </Text>
            </View>
          </View>

          {/* Địa chỉ */}
          {displayCompany.company_address && (
            <View style={styles.infoItem}>
              <Text style={styles.infoItemIcon}>📍</Text>
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Địa chỉ</Text>
                <Text style={styles.infoItemValue}>
                  {displayCompany.company_address}
                </Text>
              </View>
            </View>
          )}

          {/* Website */}
          <View style={styles.infoItem}>
            <Text style={styles.infoItemIcon}>🌐</Text>
            <View style={styles.infoItemContent}>
              <Text style={styles.infoItemTitle}>Website</Text>
              <Text style={[styles.infoItemValue, styles.websiteLink]}>
                {displayCompany.company_website ||
                  displayCompany.website ||
                  "Chưa cập nhật"}
              </Text>
            </View>
          </View>

          {/* Liên hệ */}
          {(displayCompany.contact_person ||
            displayCompany.company_phone ||
            displayCompany.company_email) && (
            <View style={styles.infoItem}>
              <Text style={styles.infoItemIcon}>📞</Text>
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Thông tin liên hệ</Text>
                {displayCompany.contact_person && (
                  <Text style={styles.infoItemValue}>
                    👤 {displayCompany.contact_person}
                  </Text>
                )}
                {displayCompany.company_phone && (
                  <Text style={styles.infoItemValue}>
                    � {displayCompany.company_phone}
                  </Text>
                )}
                {displayCompany.company_email && (
                  <Text style={styles.infoItemValue}>
                    ✉️ {displayCompany.company_email}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Company Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu công ty</Text>
          <Text style={styles.description}>
            {displayCompany.description ||
              displayCompany.company_description ||
              "Chưa có thông tin giới thiệu"}
          </Text>
        </View>

        {/* Jobs Section */}
        {jobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Việc làm đang tuyển ({jobs.length})
            </Text>
            {jobs.slice(0, 5).map((job, index) => (
              <View key={job.id || index} style={styles.jobItem}>
                <Text style={styles.jobTitle}>{job.title || job.position}</Text>
                <Text style={styles.jobSalary}>
                  {job.salary || "Thỏa thuận"}
                </Text>
                <Text style={styles.jobLocation}>
                  {job.location || job.city}
                </Text>
              </View>
            ))}
            {jobs.length > 5 && (
              <Text style={styles.moreJobsText}>
                và {jobs.length - 5} việc làm khác...
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#00b14f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  companyHeader: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  logoSection: {
    marginBottom: 16,
    alignItems: "center",
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#00b14f",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  companyInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 28,
    textAlign: "center",
  },
  companyCategory: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  followButton: {
    backgroundColor: "#00b14f",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  followButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00b14f",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  infoCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },
  infoCardValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoItemIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  infoItemValue: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
    marginBottom: 2,
  },
  jobItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 12,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  jobSalary: {
    fontSize: 14,
    color: "#00b14f",
    fontWeight: "500",
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: 12,
    color: "#666",
  },
  moreJobsText: {
    fontSize: 14,
    color: "#00b14f",
    fontStyle: "italic",
    marginTop: 8,
  },
  websiteLink: {
    color: "#00b14f",
    fontWeight: "500",
  },
});

export default CompanyDetailScreen;
