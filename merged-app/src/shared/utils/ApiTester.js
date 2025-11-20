/**
 * API Connection Test
 * Use this to test if backend is accessible
 */
import notificationApiService from '../services/api/NotificationApiService';

export const testBackendConnection = async () => {
    console.log('=== TESTING BACKEND CONNECTION ===');
    
    try {
        // Test basic fetch to backend
        const testUrl = 'http://192.168.84.11:3000/health'; // Health check endpoint
        console.log('Testing connection to:', testUrl);
        
        const response = await fetch(testUrl);
        console.log('Backend health check status:', response.status);
        
        if (response.ok) {
            const data = await response.text();
            console.log('Backend health check response:', data);
            return true;
        } else {
            console.log('Backend health check failed:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Backend connection test failed:', error);
        return false;
    }
};

export const testNotificationEndpoints = async (userId = 'test-user-123') => {
    console.log('=== TESTING NOTIFICATION ENDPOINTS ===');
    console.log('Using test user ID:', userId);
    
    const baseUrl = 'http://192.168.84.28:3000';
    
    try {
        // Test 1: Get user notifications
        console.log('1. Testing getUserNotifications...');
        console.log('URL:', `${baseUrl}/notice/user/${userId}`);
        
        const notificationsResponse = await fetch(`${baseUrl}/notice/user/${userId}`);
        console.log('Status:', notificationsResponse.status);
        
        if (notificationsResponse.ok) {
            const notifications = await notificationsResponse.json();
            console.log('✅ getUserNotifications response:', notifications);
        } else {
            const errorText = await notificationsResponse.text();
            console.log('❌ getUserNotifications failed:', errorText);
        }
        
        // Test 2: Create test notification
        console.log('2. Testing createNotification...');
        console.log('URL:', `${baseUrl}/notice/create`);
        
        const createResponse = await fetch(`${baseUrl}/notice/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient_id: userId,
                recipient_type: 'employer',
                title: 'API Test Notification',
                message: 'This is a test notification from API test',
                type: 'other',
                data: { test: true }
            })
        });
        
        console.log('Create status:', createResponse.status);
        
        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ createNotification response:', createData);
            
            // Test 3: Mark as read (if we have a notification ID)
            if (createData.data && createData.data.id) {
                console.log('3. Testing markAsRead...');
                const markReadResponse = await fetch(`${baseUrl}/notice/read/${createData.data.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });
                
                console.log('Mark read status:', markReadResponse.status);
                
                if (markReadResponse.ok) {
                    const markReadData = await markReadResponse.json();
                    console.log('✅ markAsRead response:', markReadData);
                } else {
                    const errorText = await markReadResponse.text();
                    console.log('❌ markAsRead failed:', errorText);
                }
            }
        } else {
            const errorText = await createResponse.text();
            console.log('❌ createNotification failed:', errorText);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Notification endpoints test failed:', error);
        return false;
    }
};

// Export for use in components
export default {
    testBackendConnection,
    testNotificationEndpoints
};