import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ApplicationsScreen() {
    const [activeTab, setActiveTab] = useState('all');

    const applications = [
        {
            id: 1,
            jobTitle: 'Frontend Developer',
            company: 'Tech Company A',
            appliedDate: '15/10/2025',
            status: 'pending',
            statusText: 'Đang xem xét'
        },
        {
            id: 2,
            jobTitle: 'React Native Developer',
            company: 'Startup B',
            appliedDate: '12/10/2025',
            status: 'interviewed',
            statusText: 'Đã phỏng vấn'
        },
        {
            id: 3,
            jobTitle: 'Full Stack Developer',
            company: 'Company C',
            appliedDate: '10/10/2025',
            status: 'rejected',
            statusText: 'Bị từ chối'
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FFA726';
            case 'interviewed': return '#42A5F5';
            case 'accepted': return '#66BB6A';
            case 'rejected': return '#EF5350';
            default: return '#666';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return 'hourglass-empty';
            case 'interviewed': return 'event';
            case 'accepted': return 'check-circle';
            case 'rejected': return 'cancel';
            default: return 'help';
        }
    };

    const filteredApplications = applications.filter(app => {
        if (activeTab === 'all') return true;
        return app.status === activeTab;
    });

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                        Tất cả ({applications.length})
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                        Đang xem xét
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'interviewed' && styles.activeTab]}
                    onPress={() => setActiveTab('interviewed')}
                >
                    <Text style={[styles.tabText, activeTab === 'interviewed' && styles.activeTabText]}>
                        Phỏng vấn
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.applicationList}>
                {filteredApplications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="description" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Chưa có đơn ứng tuyển nào</Text>
                        <Text style={styles.emptySubtext}>
                            Hãy bắt đầu tìm kiếm và ứng tuyển công việc yêu thích của bạn
                        </Text>
                    </View>
                ) : (
                    filteredApplications.map((application) => (
                        <TouchableOpacity key={application.id} style={styles.applicationCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.jobInfo}>
                                    <Text style={styles.jobTitle}>{application.jobTitle}</Text>
                                    <Text style={styles.company}>{application.company}</Text>
                                </View>
                                
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
                                    <MaterialIcons 
                                        name={getStatusIcon(application.status)} 
                                        size={16} 
                                        color={getStatusColor(application.status)} 
                                    />
                                    <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
                                        {application.statusText}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.cardFooter}>
                                <View style={styles.dateInfo}>
                                    <MaterialIcons name="calendar-today" size={16} color="#666" />
                                    <Text style={styles.dateText}>Ứng tuyển: {application.appliedDate}</Text>
                                </View>
                                
                                <TouchableOpacity style={styles.actionButton}>
                                    <Text style={styles.actionButtonText}>Xem chi tiết</Text>
                                    <MaterialIcons name="chevron-right" size={16} color="#00b14f" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#00b14f',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#00b14f',
        fontWeight: 'bold',
    },
    applicationList: {
        flex: 1,
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 40,
    },
    applicationCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    jobInfo: {
        flex: 1,
        marginRight: 10,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    company: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: '#00b14f',
        fontWeight: '500',
        marginRight: 2,
    },
});