import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function JobSearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');

    const jobs = [
        {
            id: 1,
            title: 'Frontend Developer',
            company: 'Tech Company A',
            location: 'Hà Nội',
            salary: '15-25 triệu',
            type: 'Full-time',
            posted: '2 ngày trước'
        },
        {
            id: 2,
            title: 'React Native Developer',
            company: 'Startup B',
            location: 'TP.HCM',
            salary: '20-30 triệu',
            type: 'Remote',
            posted: '1 tuần trước'
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.searchSection}>
                <View style={styles.searchInput}>
                    <MaterialIcons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm công việc..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                
                <View style={styles.searchInput}>
                    <MaterialIcons name="location-on" size={20} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Địa điểm..."
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <TouchableOpacity style={styles.searchButton}>
                    <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.jobList}>
                <Text style={styles.resultText}>Tìm thấy {jobs.length} công việc</Text>
                
                {jobs.map((job) => (
                    <TouchableOpacity key={job.id} style={styles.jobCard}>
                        <View style={styles.jobHeader}>
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <MaterialIcons name="bookmark-border" size={24} color="#ccc" />
                        </View>
                        
                        <Text style={styles.company}>{job.company}</Text>
                        
                        <View style={styles.jobInfo}>
                            <View style={styles.infoItem}>
                                <MaterialIcons name="location-on" size={16} color="#666" />
                                <Text style={styles.infoText}>{job.location}</Text>
                            </View>
                            
                            <View style={styles.infoItem}>
                                <MaterialIcons name="attach-money" size={16} color="#666" />
                                <Text style={styles.infoText}>{job.salary}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.jobFooter}>
                            <View style={styles.jobType}>
                                <Text style={styles.jobTypeText}>{job.type}</Text>
                            </View>
                            <Text style={styles.postedDate}>{job.posted}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
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
        marginBottom: 10,
        height: 45,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#00b14f',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    jobList: {
        flex: 1,
        padding: 20,
    },
    resultText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 15,
    },
    jobCard: {
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
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    company: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    jobInfo: {
        marginBottom: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    jobType: {
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    jobTypeText: {
        fontSize: 12,
        color: '#00b14f',
        fontWeight: '500',
    },
    postedDate: {
        fontSize: 12,
        color: '#999',
    },
});