import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationDebug() {
    const { 
        notifications, 
        user,
        userRole,
        sendTestNotification,
        error
    } = useNotifications();
    
    const { user: authUser } = useAuth();
    const isAuthenticated = !!authUser;

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Notification Debug</Text>
                <Text style={styles.errorText}>Please login to use notification debug</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Notification Debug</Text>
            
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>User Info:</Text>
                <Text style={styles.infoText}>User ID: {user?.id}</Text>
                <Text style={styles.infoText}>User Role: {userRole}</Text>
                <Text style={styles.infoText}>Notifications: {notifications.length}</Text>
            </View>

            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
                    <Text style={styles.buttonText}>Send Test Notification</Text>
                </TouchableOpacity>
            </View>

            {error && (
                <View style={styles.errorSection}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#555',
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    buttonSection: {
        gap: 8,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    errorSection: {
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
    },
});
