/**
 * Payment API Test Script
 * Test tất cả payment endpoints
 */

const API_BASE_URL = 'http://localhost:3000';
let authToken = ''; // Set your JWT token here
let testPaymentId = '';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (authToken && !options.skipAuth) {
        defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    const data = await response.json();
    return { status: response.status, data };
}

// Test 1: Create Checkout
async function testCreateCheckout() {
    console.log('\n🧪 Test 1: Create Checkout Session');
    console.log('=====================================');

    try {
        const result = await apiRequest('/payment/checkout', {
            method: 'POST',
            body: JSON.stringify({
                amount: 2500, // $25.00
                currency: 'usd',
                payment_method_types: ['card']
            })
        });

        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.payment_id) {
            testPaymentId = result.data.payment_id;
            console.log('✅ Checkout created successfully');
            console.log('💳 Checkout URL:', result.data.checkout_url);
            console.log('🆔 Payment ID:', testPaymentId);
        } else {
            console.log('❌ Failed to create checkout');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 2: Get Payment History
async function testGetPaymentHistory() {
    console.log('\n🧪 Test 2: Get Payment History');
    console.log('=====================================');

    try {
        const result = await apiRequest('/payment/history', {
            method: 'GET'
        });

        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.success) {
            console.log('✅ Payment history retrieved');
            console.log('📊 Total payments:', result.data.payments.length);
            
            if (result.data.payments.length > 0) {
                console.log('\nRecent payments:');
                result.data.payments.slice(0, 3).forEach((payment, index) => {
                    console.log(`${index + 1}. ${payment.currency.toUpperCase()} ${payment.amount_cents/100} - ${payment.status} (${payment.created_at})`);
                });
            }
        } else {
            console.log('❌ Failed to get payment history');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 3: Get Payment Details
async function testGetPaymentById() {
    console.log('\n🧪 Test 3: Get Payment Details');
    console.log('=====================================');

    if (!testPaymentId) {
        console.log('⚠️ No payment ID available. Skipping test.');
        return;
    }

    try {
        const result = await apiRequest(`/payment/${testPaymentId}`, {
            method: 'GET'
        });

        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.success) {
            console.log('✅ Payment details retrieved');
            const payment = result.data.payment;
            console.log(`💰 Amount: ${payment.currency.toUpperCase()} ${payment.amount_cents/100}`);
            console.log(`📊 Status: ${payment.status}`);
            console.log(`🏢 Provider: ${payment.provider}`);
        } else {
            console.log('❌ Failed to get payment details');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 4: Get Subscription Status
async function testGetSubscriptionStatus() {
    console.log('\n🧪 Test 4: Get Subscription Status');
    console.log('=====================================');

    try {
        const result = await apiRequest('/payment/subscription/status', {
            method: 'GET'
        });

        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.success) {
            console.log('✅ Subscription status retrieved');
            const sub = result.data.subscription;
            console.log(`💎 Level: ${sub.level}`);
            console.log(`✨ Premium: ${sub.isPremium ? 'Yes' : 'No'}`);
            console.log(`🔄 Active: ${sub.isActive ? 'Yes' : 'No'}`);
            
            if (sub.daysRemaining) {
                console.log(`📅 Days remaining: ${sub.daysRemaining}`);
            }
            
            console.log('\n📊 Payment Statistics:');
            console.log(`   Total: ${sub.stats.total}`);
            console.log(`   Succeeded: ${sub.stats.succeeded}`);
            console.log(`   Pending: ${sub.stats.pending}`);
            console.log(`   Failed: ${sub.stats.failed}`);
            console.log(`   Cancelled: ${sub.stats.cancelled}`);
        } else {
            console.log('❌ Failed to get subscription status');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 5: Cancel Payment
async function testCancelPayment() {
    console.log('\n🧪 Test 5: Cancel Payment');
    console.log('=====================================');

    if (!testPaymentId) {
        console.log('⚠️ No payment ID available. Skipping test.');
        return;
    }

    try {
        const result = await apiRequest(`/payment/${testPaymentId}/cancel`, {
            method: 'POST'
        });

        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.success) {
            console.log('✅ Payment cancelled successfully');
        } else {
            console.log('❌ Failed to cancel payment');
            console.log('Note: Payment might not be in pending status');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Test 6: Verify Payment Success
async function testVerifyPaymentSuccess() {
    console.log('\n🧪 Test 6: Verify Payment Success');
    console.log('=====================================');
    console.log('⚠️ This test requires a valid Stripe session_id');
    console.log('   Complete a test payment first and use the session_id');
    
    const testSessionId = 'cs_test_a1234567890'; // Replace with actual session ID
    
    try {
        const result = await apiRequest(`/payment/success?session_id=${testSessionId}`, {
            method: 'GET',
            skipAuth: true // Success endpoint doesn't require auth
        });

        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.success) {
            console.log('✅ Payment verified successfully');
        } else {
            console.log('❌ Payment verification failed');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Payment API Tests');
    console.log('================================\n');

    // Check if auth token is set
    if (!authToken) {
        console.log('⚠️  WARNING: No auth token set!');
        console.log('   Set authToken variable at the top of this file');
        console.log('   Some tests will fail without authentication\n');
    }

    await testCreateCheckout();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between tests
    
    await testGetPaymentHistory();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGetPaymentById();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGetSubscriptionStatus();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testCancelPayment();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testVerifyPaymentSuccess();

    console.log('\n✅ All tests completed!');
    console.log('================================\n');
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testCreateCheckout,
        testGetPaymentHistory,
        testGetPaymentById,
        testGetSubscriptionStatus,
        testCancelPayment,
        testVerifyPaymentSuccess,
        runAllTests,
        setAuthToken: (token) => { authToken = token; },
        setApiBaseUrl: (url) => { API_BASE_URL = url; }
    };
}

// Run tests if executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}
