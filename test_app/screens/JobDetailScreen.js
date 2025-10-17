import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
const api = 'http://192.168.84.11:3000'
export default function JobDetailScreen({ route }) {
    const { job, onViewsUpdate } = route.params || {};
    const [jobDetail, setJobDetail] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [views, setViews] = useState(0);

    useEffect(() => {
        if (!job || !job.id) {
            setError('No job ID provided');
            setLoading(false);
            return;
        }
        
        fetchJobDetail(job.id);
    }, [job]);

    useEffect(() => {
        const increaseViews = async () => {
            try {
                const res = await fetch(`${api}/job/views/${job.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const data = await res.json();
                console.log('Views response:', data);
                
                // Handle different response formats
                if (data.views !== undefined) {
                    setViews(data.views);
                    // Callback to update HomeScreen
                    if (onViewsUpdate && typeof onViewsUpdate === 'function') {
                        onViewsUpdate(job.id, data.views);
                    }
                } else if (data.success && data.views !== undefined) {
                    setViews(data.views);
                    // Callback to update HomeScreen
                    if (onViewsUpdate && typeof onViewsUpdate === 'function') {
                        onViewsUpdate(job.id, data.views);
                    }
                } else {
                    console.warn('Unexpected response format:', data);
                }
            } catch (err) {
                console.error('Error incrementing views:', err);
                // Set views from job data as fallback
                setViews(job.views || 0);
            }
        };

        if (job && job.id) {
            increaseViews();
        }
    }, [job]);


    const fetchJobDetail = async (jobId) => {
        try {
            setLoading(true);
            setError(null);
            
            // Thay đổi URL này thành API endpoint thực tế của bạn
            const response = await fetch(`${api}/job/getJobDetail/${jobId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setJobDetail(data);

            const companyResponse = await fetch(`${api}/employer/getCompanyInfo/${data.employer_id}`);
            if (companyResponse.ok) {
                const companyData = await companyResponse.json();
                setCompany(companyData);
            }

        } catch (err) {
            console.error('Error fetching job detail:', err);
            setError(err.message);
            
            // Fallback: sử dụng mock data nếu API fail
            setJobDetail({
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                salary: job.salary,
                description: `Đây là mô tả chi tiết cho công việc ${job.title}. Chúng tôi đang tìm kiếm một ứng viên có kinh nghiệm và đam mê trong lĩnh vực này.`,
                requirements: [
                    'Kinh nghiệm 2+ năm trong lĩnh vực liên quan',
                    'Thành thạo React / React Native',
                    'Có kinh nghiệm làm việc nhóm',
                    'Tiếng Anh giao tiếp tốt'
                ],
                benefits: [
                    'Lương competitive',
                    'Bảo hiểm đầy đủ',
                    'Môi trường làm việc thân thiện',
                    'Cơ hội phát triển nghề nghiệp'
                ],
                applicationEmail: 'hr@example.com',
                postedDate: '2024-01-15',
                deadline: '2024-02-15'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!job) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>No job data provided.</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1a73e8" />
                <Text style={styles.loadingText}>Loading job details...</Text>
            </View>
        );
    }

    if (error && !jobDetail) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <Text style={styles.paragraph}>Please try again later.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{jobDetail.title}</Text>
            <Text style={styles.company}>{company?.company_name} • {jobDetail.location}</Text>
            <Text style={styles.salary}>{jobDetail.salary}</Text>

            {jobDetail.created_at && (
                <Text style={styles.date}>Posted: {jobDetail.created_at}</Text>
            )}
            {jobDetail.exprired_date && (
                <Text style={styles.deadline}>Deadline: {jobDetail.exprired_date}</Text>
            )}
            {views >= 0 && (
                <Text style={styles.views}>Views: {views}</Text>
            )}

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.paragraph}>{jobDetail.description}</Text>

            <Text style={styles.sectionTitle}>Requirements</Text>
            {jobDetail.requirements ? (
                Array.isArray(jobDetail.requirements) ? (
                    jobDetail.requirements.map((req, index) => (
                        <Text key={index} style={styles.bulletPoint}>• {req}</Text>
                    ))
                ) : (
                    <Text style={styles.paragraph}>{jobDetail.requirements}</Text>
                )
            ) : (
                <Text style={styles.paragraph}>No specific requirements listed.</Text>
            )}

            

            <Text style={styles.sectionTitle}>How to apply</Text>
            <Text style={styles.paragraph}>
                Gửi CV về email: {company?.contact_person || 'hr@example.com'}
            </Text>
            
            {error && (
                <Text style={styles.warningText}>
                    Note: Using fallback data due to API error
                </Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
    company: { fontSize: 14, color: '#666', marginBottom: 6 },
    salary: { fontSize: 16, color: '#1a73e8', marginBottom: 8 },
    date: { fontSize: 12, color: '#888', marginBottom: 4 },
    deadline: { fontSize: 12, color: '#d73027', marginBottom: 4 },
    views: { fontSize: 12, color: '#666', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    paragraph: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 8 },
    bulletPoint: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 4, marginLeft: 8 },
    loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
    errorText: { fontSize: 16, color: '#d73027', textAlign: 'center', marginBottom: 8 },
    warningText: { fontSize: 12, color: '#ff8c00', fontStyle: 'italic', marginTop: 16, textAlign: 'center' },
});
