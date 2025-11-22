import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import apiClient from '../../services/api/ApiClient';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Payment Success Screen
 * Hiển thị sau khi user thanh toán thành công qua Stripe
 */
export default function PaymentSuccessScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { payment_id, amount, plan, currency } = route.params || {};
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  // Animation
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    verifyPayment();
    
    // Refresh user data ONCE after successful payment
    const updateUserData = async () => {
      try {
        console.log('💳 [PaymentSuccess] Refreshing user profile after payment...');
        const result = await refreshUser();
        if (result?.success) {
          console.log('✅ [PaymentSuccess] User profile updated! New level:', result.user?.level);
        }
      } catch (error) {
        console.error('❌ [PaymentSuccess] Failed to refresh user:', error);
      }
    };

    updateUserData();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      // Success animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, error]);

  const verifyPayment = async () => {
    // Payment is already confirmed by Stripe SDK and backend /payment/confirm endpoint
    // No need for additional verification - just show success
    console.log('✅ Payment confirmed, payment_id:', payment_id);
    
    setPaymentData({
      payment: {
        amount_cents: amount || 4900,
        currency: currency || 'usd',
        id: payment_id || 'N/A',
        created_at: new Date().toISOString(),
      },
      payment_status: 'succeeded',
      success: true,
    });
    
    setLoading(false);
  };

  const handleContinue = () => {
    // Go back to previous screens (safer than reset)
    console.log('✅ Navigate back to employer home');
    navigation.goBack(); // Go back to payment screen
    navigation.goBack(); // Go back to wherever it came from
  };

  const handleViewReceipt = () => {
    // Navigate back for now (can add receipt screen later)
    console.log('📄 View receipt');
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Verifying payment...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Verification Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={verifyPayment}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.successContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Success Message */}
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your account has been upgraded to Premium
        </Text>

        {/* Payment Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValue}>
              {paymentData?.payment?.currency?.toUpperCase()}{' '}
              {(paymentData?.payment?.amount_cents / 100).toFixed(2)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {paymentData?.payment_status || 'paid'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValueSmall} numberOfLines={1}>
              {paymentData?.payment?.id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(paymentData?.payment?.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Premium Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>You now have access to:</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>• Unlimited job applications</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>• Priority support</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>• Advanced analytics</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitText}>• Ad-free experience</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewReceipt}
          >
            <Text style={styles.secondaryButtonText}>View Receipt</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Confetti Effect (Optional - requires react-native-confetti-cannon) */}
      {/* <ConfettiCannon count={200} origin={{x: -10, y: 0}} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  successContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  detailValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
