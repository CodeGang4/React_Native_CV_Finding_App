import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
    const { user, logout } = useAuth();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user?.email || 'User'}!</Text>
            <Button title="Logout" onPress={logout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, marginBottom: 20 },
});
