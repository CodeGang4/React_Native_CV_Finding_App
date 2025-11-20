import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Linking,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaymentApiService from '../../../shared/services/api/PaymentApiService';

export default function UpgradeAccount({ navigation }) {
    const [loading, setLoading] = useState(false);
    
    const plan = {
        name: 'Premium',
        price: 4900, // $49.00 in cents
        currency: 'usd',
        period: '1 năm',
        displayPrice: '49.00 USD',
    };

    const handleUpgrade = async () => {
        // Use native payment screen for better UX
        navigation.navigate('NativePayment');
    };

    const handleViewPaymentHistory = () => {
        navigation.navigate('PaymentHistory');
    };
    
    const features = [
        "Phân tích mức độ cạnh tranh so với ứng viên khác không giới hạn",
        "Ưu tiên đẩy Top hiển thị với NTD 1 lần/ngày",
        "Truy cập kho CV, Cover Letter cao cấp",
        "Tạo và quản lý tối đa 12 CV và Cover Letter",
        "Gói quà tặng học tập từ đối tác Gitiho",
        "Chat trực tiếp với nhà tuyển dụng",
        "Thực hành luyện tập phỏng vấn với AI"
    ];

    return (
        <LinearGradient
            colors={['#00563B', '#1a4d3e', '#2a4756', '#3a3d5c']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Profile')}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Quay lại</Text>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Nâng cấp tài khoản</Text>
                        <Text style={styles.subtitle}>Mở khóa quyền lợi ứng viên Premium</Text>
                    </View>

                    {/* Premium Plan Card */}
                    <View style={styles.planCard}>
                        {/* Diamond Icon */}
                        <View style={styles.diamondContainer}>
                            <Text style={styles.diamondEmoji}>💎</Text>
                        </View>

                        {/* Plan Name */}
                        <Text style={styles.planName}>{plan.name}</Text>

                        {/* Price */}
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{plan.displayPrice}</Text>
                            <Text style={styles.period}> / {plan.period}</Text>
                        </View>

                        {/* Features List */}
                        <View style={styles.featuresList}>
                            {features.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <View style={styles.checkIconContainer}>
                                        <Ionicons name="checkmark-circle" size={24} color="#00b14f" />
                                    </View>
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Upgrade Button */}
                    <TouchableOpacity 
                        style={[styles.upgradeButton, loading && styles.upgradeButtonDisabled]}
                        onPress={handleUpgrade}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#00b14f" size="small" />
                        ) : (
                            <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
                        )}
                    </TouchableOpacity>

                    {/* View Payment History Button */}
                    <TouchableOpacity 
                        style={styles.historyButton}
                        onPress={handleViewPaymentHistory}
                    >
                        <Ionicons name="receipt-outline" size={20} color="#fff" />
                        <Text style={styles.historyButtonText}>Xem lịch sử thanh toán</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        marginRight: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    titleSection: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    planCard: {
        marginHorizontal: 16,
        backgroundColor: 'rgba(30, 50, 50, 0.8)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 177, 79, 0.3)',
    },
    diamondContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    diamondEmoji: {
        fontSize: 80,
    },
    planName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 30,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#00b14f',
    },
    period: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.8,
    },
    featuresList: {
        marginTop: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    checkIconContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    featureText: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
        lineHeight: 22,
    },
    upgradeButton: {
        marginHorizontal: 16,
        marginTop: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    upgradeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00b14f',
    },
    upgradeButtonDisabled: {
        opacity: 0.6,
    },
    historyButton: {
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    historyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});