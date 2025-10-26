import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function EmployerPaymentSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { payment_id, amount, plan } = route.params || {};

  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    // Animation for success icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatAmount = (amountInCents) => {
    return `$${(amountInCents / 100).toFixed(2)}`;
  };

  const handleGoToAccount = () => {
    // Navigate back to account screen and refresh
    navigation.navigate('Account');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6', '#06B6D4', '#10B981']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.successIconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successIcon}>
            <MaterialIcons name="check" size={60} color="#fff" />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={[styles.messageContainer, { opacity: opacityAnim }]}>
          <Text style={styles.successTitle}>Thanh toán thành công!</Text>
          <Text style={styles.successSubtitle}>
            Chúc mừng! Tài khoản của bạn đã được nâng cấp lên {plan || 'Employer Premium'}
          </Text>
        </Animated.View>

        {/* Payment Details */}
        <Animated.View style={[styles.detailsContainer, { opacity: opacityAnim }]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gói dịch vụ:</Text>
            <Text style={styles.detailValue}>{plan || 'Employer Premium'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tiền:</Text>
            <Text style={styles.detailValue}>{formatAmount(amount || 9900)}</Text>
          </View>
          {payment_id && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch:</Text>
              <Text style={styles.detailValue}>#{payment_id.slice(-8)}</Text>
            </View>
          )}
        </Animated.View>

        {/* Premium Features */}
        <Animated.View style={[styles.featuresContainer, { opacity: opacityAnim }]}>
          <Text style={styles.featuresTitle}>Bạn hiện có thể:</Text>
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
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonsContainer, { opacity: opacityAnim }]}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoToAccount}>
            <MaterialIcons name="account-circle" size={20} color="#1E3A8A" />
            <Text style={styles.primaryButtonText}>Xem tài khoản</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingHorizontal: 24,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 3,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});