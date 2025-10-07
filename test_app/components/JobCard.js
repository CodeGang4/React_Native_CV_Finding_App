import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function JobCard({ job, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.leftContent}>
                <Text style={styles.title}>{job.title}</Text>
                <Text style={styles.location}>{job.location}</Text>
                <Text style={styles.jobType}>{job.job_type}</Text>
                <Text style={styles.views}>{job.views || 0} views</Text>
            </View>
            <View style={styles.rightContent}>
                <Text style={styles.salary}>{job.salary}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f8f9fb',
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    leftContent: {
        flex: 1,
        marginRight: 12,
    },
    rightContent: {
        alignItems: 'flex-end',
    },
    title: { 
        fontSize: 16, 
        fontWeight: '600',
        marginBottom: 4,
        color: '#333'
    },
    location: { 
        fontSize: 13, 
        color: '#666', 
        marginBottom: 2 
    },
    jobType: { 
        fontSize: 12, 
        color: '#888', 
        marginBottom: 2,
        textTransform: 'capitalize'
    },
    views: { 
        fontSize: 11, 
        color: '#999' 
    },
    salary: { 
        fontSize: 14, 
        color: '#1a73e8', 
        fontWeight: '600' 
    },
});
