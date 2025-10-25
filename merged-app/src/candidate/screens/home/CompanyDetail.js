import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CompanyDetail({ route }) {
  const { company } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleOpenWebsite = () => {
    if (!company.website) return;
    const url = company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`;
    Linking.openURL(url);
  };

  const handleOpenAddress = () => {
    if (!company.address) return;
    const query = encodeURIComponent(company.address);
    const mapUrl =
      Platform.OS === "ios"
        ? `maps:0,0?q=${query}`
        : `geo:0,0?q=${query}`;
    Linking.openURL(mapUrl);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: company.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.name}>{company.name}</Text>
          <Text style={styles.industry}>
            {company.industry || "Chưa có ngành nghề"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="business-outline" size={20} color="#00b14f" />
            <Text style={styles.infoText}>
              Quy mô: {company.size || "Không rõ"}
            </Text>
          </View>

          <TouchableOpacity style={styles.infoRow} onPress={handleOpenAddress}>
            <Icon name="location-outline" size={20} color="#00b14f" />
            <Text style={[styles.infoText, styles.linkText]}>
              {company.address || "Không rõ địa chỉ"}
            </Text>
          </TouchableOpacity>

          {company.website && (
            <TouchableOpacity style={styles.infoRow} onPress={handleOpenWebsite}>
              <Icon name="globe-outline" size={20} color="#00b14f" />
              <Text style={[styles.infoText, styles.linkText]}>
                {company.website}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu công ty</Text>
          <Text style={styles.description}>
            {company.description || "Chưa có mô tả"}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom > 10 ? insets.bottom : 16 },
        ]}
      >
        <TouchableOpacity
          style={styles.viewJobsButton}
          onPress={() =>
            navigation.navigate("JobSearchScreen", {
              searchQuery: company.name,
            })
          }
        >
          <Icon name="briefcase-outline" size={20} color="#fff" />
          <Text style={styles.viewJobsText}>
            Xem việc làm tại {company.name}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  logo: {
    width: 300,
    height: 200,
    borderRadius: 24,
    marginBottom: 12,
    backgroundColor: "#f2f2f2",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
  },
  industry: {
    fontSize: 16,
    color: "#00b14f",
    textAlign: "center",
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
    flexShrink: 1,
  },
  linkText: {
    color: "#007aff",
    textDecorationLine: "underline",
  },

  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    paddingBottom: 16,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  viewJobsButton: {
    backgroundColor: "#00b14f",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
  },
  viewJobsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
