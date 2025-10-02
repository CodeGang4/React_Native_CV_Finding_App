import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function AccountScreen({ navigation }) {
    const { user, logout, switchRole } = useAuth();

    const menuItems = [
        {
            icon: 'business',
            title: 'Thông tin công ty',
            subtitle: 'Cập nhật thông tin và logo công ty',
            onPress: () => {}
        },
        {
            icon: 'work',
            title: 'Quản lý tin đăng',
            subtitle: 'Xem và chỉnh sửa các tin tuyển dụng',
            onPress: () => navigation.navigate('JobPosting')
        },
        {
            icon: 'analytics',
            title: 'Báo cáo thống kê',
            subtitle: 'Xem hiệu quả tuyển dụng',
            onPress: () => {}
        },
        {
            icon: 'payment',
            title: 'Thanh toán & Gói dịch vụ',
            subtitle: 'Quản lý gói và lịch sử thanh toán',
            onPress: () => {}
        },
        {
            icon: 'settings',
            title: 'Cài đặt',
            subtitle: 'Thông báo, bảo mật và quyền riêng tư',
            onPress: () => {}
        },
        {
            icon: 'swap-horiz',
            title: 'Chuyển sang ứng viên',
            subtitle: 'Chuyển đổi sang chế độ tìm việc',
            onPress: () => switchRole('candidate')
        },
        {
            icon: 'help',
            title: 'Trung tâm trợ giúp',
            subtitle: 'FAQ và hướng dẫn sử dụng',
            onPress: () => {}
        },
        {
            icon: 'feedback',
            title: 'Gửi phản hồi',
            subtitle: 'Báo lỗi hoặc đóng góp ý kiến',
            onPress: () => {}
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tài khoản</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <MaterialIcons name="business" size={40} color="#2196F3" />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.companyName}>{user?.username || 'Tên công ty'}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                            <View style={styles.planBadge}>
                                <Text style={styles.planText}>Gói cơ bản</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <MaterialIcons name="edit" size={20} color="#2196F3" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsSection}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Tin đăng</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>48</Text>
                        <Text style={styles.statLabel}>Ứng viên</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>156</Text>
                        <Text style={styles.statLabel}>Lượt xem</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuIconContainer}>
                                <MaterialIcons name={item.icon} size={24} color="#666" />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <MaterialIcons name="exit-to-app" size={24} color="#fff" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    profileSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    planBadge: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    planText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    editButton: {
        padding: 8,
    },
    statsSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
    },
    menuSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F0F0F0',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#999',
    },
    logoutButton: {
        backgroundColor: '#F44336',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 12,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});