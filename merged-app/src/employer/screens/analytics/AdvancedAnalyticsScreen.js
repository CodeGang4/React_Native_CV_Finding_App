import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import EmployerPremiumGate from '../../../shared/components/EmployerPremiumGate';

export default function AdvancedAnalyticsScreen() {
  const navigation = useNavigation();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalyticsData({
        totalCandidates: 1250,
        qualifiedCandidates: 328,
        averageExperience: 3.2,
        topSkills: ['JavaScript', 'React', 'Node.js', 'Python'],
        applicationTrends: [120, 145, 98, 165, 201],
      });
      setLoading(false);
    }, 1500);
  }, []);

  const renderAnalyticsContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Đang phân tích dữ liệu...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phân tích nâng cao</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialIcons name="settings" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Analytics Cards */}
        <View style={styles.analyticsContainer}>
          {/* Overview Cards */}
          <View style={styles.cardsRow}>
            <View style={styles.analyticsCard}>
              <MaterialIcons name="people" size={32} color="#1E3A8A" />
              <Text style={styles.cardNumber}>{analyticsData.totalCandidates}</Text>
              <Text style={styles.cardLabel}>Tổng ứng viên</Text>
            </View>
            <View style={styles.analyticsCard}>
              <MaterialIcons name="verified" size={32} color="#10B981" />
              <Text style={styles.cardNumber}>{analyticsData.qualifiedCandidates}</Text>
              <Text style={styles.cardLabel}>Phù hợp</Text>
            </View>
          </View>

          {/* Experience Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Kinh nghiệm trung bình</Text>
            <View style={styles.experienceChart}>
              <Text style={styles.experienceNumber}>{analyticsData.averageExperience}</Text>
              <Text style={styles.experienceLabel}>năm</Text>
            </View>
          </View>

          {/* Top Skills */}
          <View style={styles.skillsCard}>
            <Text style={styles.cardTitle}>Kỹ năng phổ biến</Text>
            <View style={styles.skillsList}>
              {analyticsData.topSkills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* AI Recommendations */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <MaterialIcons name="smart-toy" size={24} color="#FFD700" />
              <Text style={styles.aiTitle}>Gợi ý AI</Text>
            </View>
            <Text style={styles.aiText}>
              Dựa trên phân tích, bạn nên tập trung vào ứng viên có kinh nghiệm 2-4 năm với JavaScript và React.
            </Text>
            <TouchableOpacity style={styles.aiButton}>
              <Text style={styles.aiButtonText}>Xem thêm gợi ý</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <EmployerPremiumGate feature="phân tích nâng cao">
        {renderAnalyticsContent()}
      </EmployerPremiumGate>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  settingsButton: {
    padding: 8,
  },
  analyticsContainer: {
    padding: 16,
    gap: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    marginVertical: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  experienceChart: {
    alignItems: 'center',
    padding: 20,
  },
  experienceNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  experienceLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  skillsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  skillText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  aiCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  aiText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 16,
  },
  aiButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});