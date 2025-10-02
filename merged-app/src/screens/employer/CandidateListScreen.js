import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CandidateListScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    const candidates = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            position: 'Frontend Developer',
            experience: '3 năm',
            skills: ['React', 'JavaScript', 'HTML/CSS'],
            location: 'Hà Nội',
            status: 'available',
            rating: 4.5
        },
        {
            id: 2,
            name: 'Trần Thị B',
            position: 'React Native Developer',
            experience: '2 năm',
            skills: ['React Native', 'JavaScript', 'Redux'],
            location: 'TP.HCM',
            status: 'interviewing',
            rating: 4.8
        },
        {
            id: 3,
            name: 'Lê Văn C',
            position: 'Full Stack Developer',
            experience: '5 năm',
            skills: ['Node.js', 'React', 'MongoDB'],
            location: 'Đà Nẵng',
            status: 'hired',
            rating: 4.9
        },
    ];

    const filters = [
        { value: 'all', label: 'Tất cả' },
        { value: 'available', label: 'Sẵn sàng' },
        { value: 'interviewing', label: 'Đang phỏng vấn' },
        { value: 'hired', label: 'Đã tuyển' },
    ];

    const getStatusInfo = (status) => {
        switch (status) {
            case 'available':
                return { text: 'Sẵn sàng', color: '#4CAF50', icon: 'check-circle' };
            case 'interviewing':
                return { text: 'Đang phỏng vấn', color: '#FF9800', icon: 'schedule' };
            case 'hired':
                return { text: 'Đã tuyển', color: '#2196F3', icon: 'work' };
            default:
                return { text: 'Không xác định', color: '#666', icon: 'help' };
        }
    };

    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || candidate.status === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <MaterialIcons key={`full-${i}`} name="star" size={16} color="#FFD700" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <MaterialIcons key="half" name="star-half" size={16} color="#FFD700" />
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <MaterialIcons key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />
            );
        }

        return stars;
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchSection}>
                <View style={styles.searchInput}>
                    <MaterialIcons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm ứng viên..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            style={[
                                styles.filterButton,
                                selectedFilter === filter.value && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedFilter(filter.value)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter.value && styles.filterTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.candidateList}>
                <Text style={styles.resultText}>
                    Tìm thấy {filteredCandidates.length} ứng viên
                </Text>

                {filteredCandidates.map((candidate) => {
                    const statusInfo = getStatusInfo(candidate.status);
                    return (
                        <TouchableOpacity key={candidate.id} style={styles.candidateCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.avatarContainer}>
                                    <MaterialIcons name="person" size={32} color="#666" />
                                </View>
                                
                                <View style={styles.candidateInfo}>
                                    <Text style={styles.candidateName}>{candidate.name}</Text>
                                    <Text style={styles.candidatePosition}>{candidate.position}</Text>
                                    
                                    <View style={styles.ratingContainer}>
                                        {renderStars(candidate.rating)}
                                        <Text style={styles.ratingText}>({candidate.rating})</Text>
                                    </View>
                                </View>
                                
                                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                                    <MaterialIcons name={statusInfo.icon} size={16} color={statusInfo.color} />
                                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                        {statusInfo.text}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.candidateDetails}>
                                <View style={styles.detailItem}>
                                    <MaterialIcons name="work" size={16} color="#666" />
                                    <Text style={styles.detailText}>{candidate.experience} kinh nghiệm</Text>
                                </View>
                                
                                <View style={styles.detailItem}>
                                    <MaterialIcons name="location-on" size={16} color="#666" />
                                    <Text style={styles.detailText}>{candidate.location}</Text>
                                </View>
                            </View>

                            <View style={styles.skillsContainer}>
                                <Text style={styles.skillsLabel}>Kỹ năng:</Text>
                                <View style={styles.skillsWrapper}>
                                    {candidate.skills.map((skill, index) => (
                                        <View key={index} style={styles.skillTag}>
                                            <Text style={styles.skillText}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <MaterialIcons name="visibility" size={20} color="#2196F3" />
                                    <Text style={styles.actionButtonText}>Xem hồ sơ</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                                    <MaterialIcons name="email" size={20} color="#fff" />
                                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Liên hệ</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    filterSection: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
        backgroundColor: '#fff',
    },
    filterButtonActive: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '500',
    },
    candidateList: {
        flex: 1,
        padding: 20,
    },
    resultText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 15,
    },
    candidateCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    candidateInfo: {
        flex: 1,
    },
    candidateName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    candidatePosition: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
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
    candidateDetails: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    detailText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    skillsContainer: {
        marginBottom: 15,
    },
    skillsLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    skillsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillTag: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 4,
    },
    skillText: {
        fontSize: 11,
        color: '#1976d2',
        fontWeight: '500',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2196F3',
        marginRight: 8,
    },
    primaryAction: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    actionButtonText: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '500',
        marginLeft: 4,
    },
});