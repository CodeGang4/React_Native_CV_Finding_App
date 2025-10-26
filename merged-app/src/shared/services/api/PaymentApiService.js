import apiClient from './ApiClient';
import config from '../../config/environment';

/**
 * Payment API Service
 * Handles payment-related API calls
 */
export class PaymentApiService {
  static endpoint = '/payment';

  /**
   * Create Payment Intent for native card input
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code (usd, vnd, etc.)
   * @returns {Promise<{clientSecret, payment_id}>}
   */
  static async createPaymentIntent(amount, currency = 'usd') {
    const response = await apiClient.post(
      `${this.endpoint}/create-intent`,
      {
        amount,
        currency,
      },
      {
        priority: 'high',
        retryable: true,
      }
    );
    return response.data;
  }

  /**
   * Confirm payment after successful Stripe payment
   * @param {string} paymentIntentId - Stripe PaymentIntent ID
   * @returns {Promise<{success, message, payment, user_level}>}
   */
  static async confirmPayment(paymentIntentId) {
    const response = await apiClient.post(
      `${this.endpoint}/confirm`,
      {
        payment_intent_id: paymentIntentId,
      },
      {
        priority: 'high',
        retryable: true,
      }
    );
    return response.data;
  }

  /**
   * Create checkout session (for web-based checkout)
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code (usd, vnd, etc.)
   * @returns {Promise<{payment_id, session_id, checkout_url}>}
   */
  static async createCheckout(amount, currency = 'usd') {
    // Use custom scheme for deep links (works in both dev and prod)
    const deepLinkOrigin = `${config.deepLinkScheme}://`;
    
    const response = await apiClient.post(
      `${this.endpoint}/checkout`,
      {
        amount,
        currency,
        payment_method_types: ['card'],
      },
      {
        priority: 'high',
        retryable: true,
        headers: {
          'x-app-origin': deepLinkOrigin, // Send custom scheme to backend
        },
      }
    );
    return response.data;
  }

  /**
   * Verify payment success
   * @param {string} sessionId - Stripe session ID
   * @returns {Promise<{success, payment_status, payment}>}
   */
  static async verifyPayment(sessionId) {
    const response = await apiClient.get(`${this.endpoint}/success`, {
      params: { session_id: sessionId },
      priority: 'high',
    });
    return response.data;
  }

  /**
   * Get payment history for current user
   * @returns {Promise<{success, payments}>}
   */
  static async getPaymentHistory() {
    const response = await apiClient.get(`${this.endpoint}/history`, {
      priority: 'normal',
    });
    return response.data;
  }

  /**
   * Get payment details by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<{success, payment}>}
   */
  static async getPaymentById(paymentId) {
    const response = await apiClient.get(`${this.endpoint}/${paymentId}`, {
      priority: 'normal',
    });
    return response.data;
  }

  /**
   * Cancel pending payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise<{success, message}>}
   */
  static async cancelPayment(paymentId) {
    const response = await apiClient.post(
      `${this.endpoint}/${paymentId}/cancel`,
      {},
      {
        priority: 'high',
        retryable: false,
      }
    );
    return response.data;
  }

  /**
   * Get user's subscription status
   * @returns {Promise<{success, subscription}>}
   */
  static async getSubscriptionStatus() {
    const response = await apiClient.get(`${this.endpoint}/subscription`, {
      priority: 'normal',
    });
    return response.data;
  }
}

export default PaymentApiService;
