import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import EmployerPremiumGate from '../../../shared/components/EmployerPremiumGate';

export default function AICandidateRecommendationsScreen() {
  const navigation = useNavigation();

  const renderAIContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Gợi ý ứng viên</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* AI Recommendations */}
      <View style={styles.recommendationsContainer}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="smart-toy" size={24} color="#FFD700" />
          <Text style={styles.sectionTitle}>Ứng viên được AI gợi ý</Text>
        </View>

        {/* Top Match */}
        <View style={styles.topMatchCard}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>98% phù hợp</Text>
          </View>
          <Text style={styles.candidateName}>Nguyễn Văn A</Text>
          <Text style={styles.candidateRole}>Senior React Developer</Text>
          <Text style={styles.candidateExperience}>5 năm kinh nghiệm</Text>
          
          <View style={styles.skillsContainer}>
            {['React', 'Node.js', 'TypeScript'].map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewProfileButton}>
            <Text style={styles.viewProfileText}>Xem hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Other Recommendations */}
        {[
          { name: 'Trần Thị B', role: 'Frontend Developer', match: 95 },
          { name: 'Lê Văn C', role: 'Full Stack Developer', match: 92 },
          { name: 'Phạm Thị D', role: 'React Native Developer', match: 89 },
        ].map((candidate, index) => (
          <View key={index} style={styles.candidateCard}>
            <View style={styles.candidateInfo}>
              <Text style={styles.candidateName}>{candidate.name}</Text>
              <Text style={styles.candidateRole}>{candidate.role}</Text>
            </View>
            <View style={styles.matchScore}>
              <Text style={styles.matchPercentage}>{candidate.match}%</Text>
              <Text style={styles.matchLabel}>phù hợp</Text>
            </View>
          </View>
        ))}

        {/* AI Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Thông tin chi tiết từ AI</Text>
          <Text style={styles.insightsText}>
            • Có 12 ứng viên phù hợp với yêu cầu React Developer{'\n'}
            • Kỹ năng được tìm kiếm nhiều nhất: React, Node.js, TypeScript{'\n'}
            • Mức lương trung bình: $2,500 - $4,000{'\n'}
            • Thời gian tuyển dụng ước tính: 2-3 tuần
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <EmployerPremiumGate feature="gợi ý ứng viên AI">
        {renderAIContent()}
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
  refreshButton: {
    padding: 8,
  },
  recommendationsContainer: {
    padding: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  topMatchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  matchBadge: {
    backgroundColor: '#10B981',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  matchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  candidateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  candidateRole: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  candidateExperience: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  skillText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  viewProfileButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  candidateInfo: {
    flex: 1,
  },
  matchScore: {
    alignItems: 'center',
  },
  matchPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  matchLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  insightsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});