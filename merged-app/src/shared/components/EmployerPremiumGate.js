import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useEmployerPremiumAccess } from '../hooks/useEmployerPremiumAccess';

export default function EmployerPremiumGate({ 
  children, 
  feature = "tính năng này",
  showUpgradeButton = true 
}) {
  const navigation = useNavigation();
  const { hasAccess, loading } = useEmployerPremiumAccess();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  if (hasAccess) {
    return children;
  }

  return (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6', '#06B6D4', '#10B981']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Premium Icon */}
        <View style={styles.premiumIcon}>
          <MaterialIcons name="workspace-premium" size={64} color="#FFD700" />
        </View>

        {/* Message */}
        <Text style={styles.title}>Tính năng Premium</Text>
        <Text style={styles.subtitle}>
          Để sử dụng {feature}, bạn cần nâng cấp lên tài khoản Employer Premium
        </Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Employer Premium bao gồm:</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="business-center" size={20} color="#10B981" />
              <Text style={styles.featureText}>Đăng tin tuyển dụng không giới hạn</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="smart-toy" size={20} color="#10B981" />
              <Text style={styles.featureText}>AI gợi ý ứng viên phù hợp</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="people" size={20} color="#10B981" />
              <Text style={styles.featureText}>Truy cập database ứng viên cao cấp</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="analytics" size={20} color="#10B981" />
              <Text style={styles.featureText}>Báo cáo phân tích chi tiết</Text>
            </View>
          </View>
        </View>

        {/* Upgrade Button */}
        {showUpgradeButton && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('EmployerUpgradeAccount')}
          >
            <MaterialIcons name="upgrade" size={20} color="#1E3A8A" />
            <Text style={styles.upgradeButtonText}>Nâng cấp Employer Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    textAlign: 'center',
  },
  premiumIcon: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
});