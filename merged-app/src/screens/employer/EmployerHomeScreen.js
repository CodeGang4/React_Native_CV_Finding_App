import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployerHomeScreen({ navigation }) {
    const { user } = useAuth();
    const [search, setSearch] = useState('');

    const quickActions = [
        { title: 'Đăng tin', icon: 'add-circle', screen: 'JobPosting', color: '#2196F3' },
        { title: 'Ứng viên', icon: 'people', screen: 'CandidateList', color: '#4CAF50' },
        { title: 'Thống kê', icon: 'analytics', screen: 'Analytics', color: '#FF9800' },
        { title: 'Thông báo', icon: 'notifications', screen: 'Notification', color: '#9C27B0' },
        { title: 'Cài đặt', icon: 'settings', screen: 'Settings', color: '#607D8B' },
    ];

    const stats = [
        { label: 'Tin đăng tuyển', value: '12', icon: 'work' },
        { label: 'Đơn ứng tuyển', value: '48', icon: 'description' },
        { label: 'Ứng viên mới', value: '15', icon: 'person-add' },
    ];

    const recentActivities = [
        { id: 1, type: 'application', message: 'Nguyễn Văn A đã ứng tuyển vị trí Frontend Developer', time: '5 phút trước' },
        { id: 2, type: 'view', message: 'Tin tuyển dụng React Native Developer được xem 12 lần', time: '1 giờ trước' },
        { id: 3, type: 'application', message: 'Trần Thị B đã ứng tuyển vị trí UI/UX Designer', time: '2 giờ trước' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
            
            {/* Header with gradient */}
            <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.headerContainer}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Chào mừng!</Text>
                        <Text style={styles.companyName}>{user?.username || 'Nhà tuyển dụng'}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <MaterialIcons name="account-circle" size={40} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate(action.screen)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                                <MaterialIcons name={action.icon} size={24} color="#fff" />
                            </View>
                            <Text style={styles.quickActionText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
                    <View style={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <MaterialIcons name={stat.icon} size={32} color="#2196F3" />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Recent Activities */}
                <View style={styles.activitiesContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {recentActivities.map((activity) => (
                        <View key={activity.id} style={styles.activityItem}>
                            <View style={styles.activityIcon}>
                                <MaterialIcons 
                                    name={activity.type === 'application' ? 'person' : 'visibility'} 
                                    size={20} 
                                    color="#2196F3" 
                                />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityMessage}>{activity.message}</Text>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Quick Tips */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.sectionTitle}>Mẹo tuyển dụng</Text>
                    <View style={styles.tipCard}>
                        <MaterialIcons name="lightbulb" size={24} color="#FF9800" />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Tối ưu hóa tin đăng</Text>
                            <Text style={styles.tipDescription}>
                                Thêm mô tả chi tiết và yêu cầu cụ thể để thu hút ứng viên phù hợp
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        paddingTop: 44,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },
    profileButton: {
        padding: 4,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        alignItems: 'center',
        flex: 1,
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: -10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: '500',
    },
    statsContainer: {
        marginTop: 20,
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: '30%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIconContainer: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    activitiesContainer: {
        marginBottom: 24,
    },
    activityItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityMessage: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#999',
    },
    tipsContainer: {
        marginBottom: 24,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tipContent: {
        flex: 1,
        marginLeft: 12,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    tipDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});