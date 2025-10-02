import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleSelectionScreen() {
    const { switchRole, user } = useAuth();

    const handleRoleSelect = async (role) => {
        await switchRole(role);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chào mừng {user?.username || user?.email}!</Text>
            <Text style={styles.subtitle}>Vui lòng chọn vai trò của bạn:</Text>
            
            <TouchableOpacity
                style={[styles.roleCard, styles.candidateCard]}
                onPress={() => handleRoleSelect('candidate')}
            >
                <MaterialIcons name="person-search" size={60} color="#00b14f" />
                <Text style={styles.roleTitle}>Người tìm việc</Text>
                <Text style={styles.roleDescription}>
                    Tìm kiếm công việc phù hợp, ứng tuyển và quản lý hồ sơ của bạn
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.roleCard, styles.employerCard]}
                onPress={() => handleRoleSelect('employer')}
            >
                <MaterialIcons name="business" size={60} color="#2196F3" />
                <Text style={styles.roleTitle}>Nhà tuyển dụng</Text>
                <Text style={styles.roleDescription}>
                    Đăng tin tuyển dụng, tìm kiếm và quản lý ứng viên
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#666',
    },
    roleCard: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    candidateCard: {
        borderLeftWidth: 5,
        borderLeftColor: '#00b14f',
    },
    employerCard: {
        borderLeftWidth: 5,
        borderLeftColor: '#2196F3',
    },
    roleTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: '#333',
    },
    roleDescription: {
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
        lineHeight: 20,
    },
});