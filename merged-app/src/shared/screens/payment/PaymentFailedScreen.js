import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Payment Failed/Cancelled Screen
 * Hiển thị khi user hủy thanh toán hoặc thanh toán thất bại
 */
export default function PaymentFailedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { reason = 'cancelled' } = route.params || {};

  // Animation
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getMessage = () => {
    switch (reason) {
      case 'failed':
        return {
          icon: 'close-circle',
          color: '#f44336',
          title: 'Payment Failed',
          subtitle: 'Your payment could not be processed',
          description:
            'There was an issue processing your payment. Please check your payment details and try again.',
        };
      case 'cancelled':
      default:
        return {
          icon: 'close-circle-outline',
          color: '#FF9800',
          title: 'Payment Cancelled',
          subtitle: 'You cancelled the payment',
          description:
            'No charges have been made to your account. You can try again whenever you\'re ready.',
        };
    }
  };

  const messageConfig = getMessage();

  const handleTryAgain = () => {
    // Navigate back to upgrade/payment page
    navigation.navigate('UpgradeAccount');
  };

  const handleContactSupport = () => {
    // Navigate to support or open email
    navigation.navigate('Support');
  };

  const handleGoHome = () => {
    // Navigate to home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={messageConfig.icon}
            size={100}
            color={messageConfig.color}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{messageConfig.title}</Text>
        <Text style={styles.subtitle}>{messageConfig.subtitle}</Text>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{messageConfig.description}</Text>
        </View>

        {/* Common Issues */}
        {reason === 'failed' && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Common issues:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="alert-circle-outline" size={20} color="#666" />
              <Text style={styles.tipText}>Insufficient funds</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="alert-circle-outline" size={20} color="#666" />
              <Text style={styles.tipText}>Incorrect card details</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="alert-circle-outline" size={20} color="#666" />
              <Text style={styles.tipText}>Card declined by bank</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="alert-circle-outline" size={20} color="#666" />
              <Text style={styles.tipText}>Expired card</Text>
            </View>
          </View>
        )}

        {/* Premium Benefits Reminder */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>
            💎 Premium benefits you're missing:
          </Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="star-outline" size={18} color="#FFB300" />
              <Text style={styles.benefitText}>Unlimited applications</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up-outline" size={18} color="#FFB300" />
              <Text style={styles.benefitText}>Priority listing</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#FFB300" />
              <Text style={styles.benefitText}>Verified badge</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: messageConfig.color },
            ]}
            onPress={handleTryAgain}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="help-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.secondaryButtonText}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.textButton} onPress={handleGoHome}>
            <Text style={styles.textButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Safe to continue */}
        <View style={styles.safetyNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.safetyText}>
            Your account is safe. No charges were made.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  benefitsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
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
  textButton: {
    padding: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#666',
    fontSize: 14,
  },
  safetyNotice: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  safetyText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
