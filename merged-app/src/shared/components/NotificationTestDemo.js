import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationTestDemo() {
    const { 
        user, 
        userRole,
        sendTestNotification 
    } = useNotifications();
    
    const { user: authUser } = useAuth();
    const isAuthenticated = !!authUser;

    const handleTestNotification = async () => {
        if (!user?.id || !userRole) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        try {
            await sendTestNotification();
            Alert.alert('Success', 'Test notification sent');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Notification Test Demo</Text>
                <Text style={styles.errorText}>Please login to test notifications</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Notification Test Demo</Text>
            
            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Current User:</Text>
                <Text style={styles.infoText}>User ID: {user?.id}</Text>
                <Text style={styles.infoText}>Role: {userRole}</Text>
            </View>

            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.button} onPress={handleTestNotification}>
                    <Text style={styles.buttonText}>Send Test Notification</Text>
                </TouchableOpacity>
            </View>
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
        gap: 12,
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
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
    },
});