import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

// Helper functions để format data
const formatSalary = (salary) => {
  if (!salary || salary === "Thỏa thuận") return "TT";

  // Nếu là số, format với đơn vị
  if (typeof salary === "number") {
    if (salary >= 1000000) {
      return `${(salary / 1000000).toFixed(1)}M`;
    } else if (salary >= 1000) {
      return `${(salary / 1000).toFixed(0)}K`;
    }
    return `${salary}`;
  }

  // Nếu là string, truncate nếu quá dài cho 1 hàng
  const salaryStr = String(salary);
  if (salaryStr.length > 10) {
    return salaryStr.substring(0, 8) + "...";
  }
  return salaryStr;
};

const formatLocation = (location) => {
  if (!location) return "N/A";

  const locationStr = String(location);

  // Tách và lấy thông tin quan trọng nhất
  const parts = locationStr.split(",").map((part) => part.trim());

  if (parts.length > 1) {
    // Lấy phần cuối (thường là thành phố) hoặc phần đầu (quận/huyện)
    const mainLocation = parts[parts.length - 1] || parts[0];
    if (mainLocation.length > 12) {
      return mainLocation.substring(0, 10) + "...";
    }
    return mainLocation;
  }

  // Truncate nếu quá dài cho 1 hàng
  if (locationStr.length > 12) {
    return locationStr.substring(0, 10) + "...";
  }

  return locationStr;
};

const formatDeadline = (deadline) => {
  if (!deadline) return "N/A";

  const deadlineStr = String(deadline);

  // Nếu là date format, rút gọn
  if (deadlineStr.includes("/")) {
    const parts = deadlineStr.split("/");
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}`; // Chỉ hiện ngày/tháng
    }
  }

  // Truncate nếu quá dài cho 1 hàng
  if (deadlineStr.length > 10) {
    return deadlineStr.substring(0, 8) + "...";
  }

  return deadlineStr;
};

// Shared Job Detail Header
// Props: { job: { title, company, salary, location, deadline }, onBack: () => void }
export default function JobDetailHeader({ job, onBack }) {
  return (
    <LinearGradient colors={["#4CAF50", "#45a049"]} style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color="#fff" />
        </View>
      </View>
      <View style={styles.jobHeaderInfo}>
        <Text style={styles.jobTitle}>
          {job?.title || "Chi tiết tuyển dụng"}
        </Text>
        {!!job?.company && (
          <Text style={styles.companyName}>{job.position}</Text>
        )}
        <View style={styles.jobStats}>
          <View style={styles.statItem}>
            <MaterialIcons
              name="attach-money"
              size={18}
              color="#fff"
              style={styles.statIcon}
            />
            <Text
              style={styles.statValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {formatSalary(job?.salary) || "—"}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons
              name="location-on"
              size={18}
              color="#fff"
              style={styles.statIcon}
            />
            <Text
              style={styles.statValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {formatLocation(job?.location) || "—"}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons
              name="schedule"
              size={18}
              color="#fff"
              style={styles.statIcon}
            />
            <Text
              style={styles.statValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {formatDeadline(job?.deadline) || "—"}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 40, paddingBottom: 20, paddingHorizontal: 16 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  jobHeaderInfo: { alignItems: "center" },
  jobTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 16,
  },
  jobStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statValue: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
    textAlign: "center",
    flexShrink: 1,
  },
  statIcon: {
    opacity: 0.9,
  },
});
