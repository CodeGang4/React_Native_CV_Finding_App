import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import PaymentApiService from '../../../shared/services/api/PaymentApiService';

export default function EmployerNativePaymentScreen() {
  const navigation = useNavigation();
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  // Employer Premium price: $99
  const PRICE = 9900; // $99.00 in cents
  const CURRENCY = 'usd';

  const handlePayment = async () => {
    console.log('🚀 START handlePayment - Employer');
    
    if (!cardComplete) {
      console.log(' Card not complete');
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin thẻ');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating payment intent for Employer Premium $99');
      console.log('Amount:', PRICE, 'Currency:', CURRENCY);

      // 1. Create payment intent on backend
      const response = await PaymentApiService.createPaymentIntent(
        PRICE,
        CURRENCY
      );

      console.log(' Backend response:', response);
      const { clientSecret, payment_id } = response;
      console.log(' Payment intent created:', payment_id);
      console.log(' Client Secret:', clientSecret?.substring(0, 20) + '...');

      if (!clientSecret) {
        throw new Error('No client secret received from backend');
      }

      // 2. Confirm payment with card details
      console.log(' About to call confirmPayment...');
      console.log(' confirmPayment type:', typeof confirmPayment);
      
      const confirmResult = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      console.log('Confirm Result:', confirmResult);
      console.log('Result keys:', Object.keys(confirmResult || {}));

      const { error, paymentIntent } = confirmResult;

      if (error) {
        console.error(' Payment error object:', error);
        console.error(' Error code:', error.code);
        console.error(' Error message:', error.message);
        console.error(' Error type:', error.type);
        console.error(' Full error:', JSON.stringify(error, null, 2));
        
        Alert.alert(
          'Thanh toán thất bại',
          `${error.message || 'Đã xảy ra lỗi khi thanh toán'}\n\nCode: ${error.code || 'N/A'}`,
          [{ text: 'OK' }]
        );
      } else if (paymentIntent) {
        console.log(' Payment successful!');
        console.log(' PaymentIntent ID:', paymentIntent.id);
        console.log(' PaymentIntent status:', paymentIntent.status);
        
        // Confirm payment on backend to update status and upgrade user
        try {
          console.log('Confirming payment on backend...');
          const confirmResponse = await PaymentApiService.confirmPayment(paymentIntent.id);
          console.log(' Backend confirmed:', confirmResponse);
        } catch (confirmError) {
          console.error(' Backend confirmation failed:', confirmError);
          // Still navigate to success even if confirmation fails
          // Webhook will eventually update the status
        }
        
        // Navigate to success screen
        navigation.replace('EmployerPaymentSuccess', {
          payment_id: payment_id,
          amount: PRICE,
          plan: 'Employer Premium',
        });
      } else {
        console.log(' No error but no paymentIntent either');
        Alert.alert('Lỗi', 'Không nhận được kết quả từ Stripe');
      }
    } catch (error) {
      console.error(' CATCH block error:', error);
      console.error(' Error name:', error.name);
      console.error(' Error message:', error.message);
      console.error(' Error stack:', error.stack);
      
      Alert.alert(
        'Lỗi', 
        `${error.message || 'Đã xảy ra lỗi khi thanh toán'}\n\n${error.name || ''}`
      );
    } finally {
      console.log('FINISH handlePayment - Employer');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Card Input Fields */}
        <View style={styles.formContainer}>
          <View style={styles.priceHeader}>
            <Text style={styles.priceLabel}>Tổng thanh toán</Text>
            <Text style={styles.priceAmount}>$99.00</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Thông tin thẻ</Text>
          
          {/* Stripe CardField Component */}
          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: '4242 4242 4242 4242',
                expiry: 'MM/YY',
                cvc: 'CVC',
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
                console.log('Card complete:', cardDetails.complete);
              }}
            />
          </View>

          <Text style={styles.secureNote}>
            <MaterialIcons name="verified-user" size={14} color="#6B7280" />
            {' '}Thanh toán được bảo mật bởi Stripe
          </Text>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            (!cardComplete || loading) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!cardComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="lock" size={20} color="#fff" />
              <Text style={styles.payButtonText}>
                Thanh toán $99.00
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
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
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00b14f',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  cardFieldContainer: {
    marginBottom: 20,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  secureNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00b14f',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#00b14f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});