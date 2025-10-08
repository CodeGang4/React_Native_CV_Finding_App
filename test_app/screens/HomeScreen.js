import React,{useState , useEffect, useCallback} from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import JobCard from '../components/JobCard';
import axios from "axios"
const api = 'http://172.20.10.10:3000/job'

export default function HomeScreen({ navigation }) {
    const [jobs,setJobs] = useState([]);
    const [hiddenJobs,setHiddenJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [openCardId, setOpenCardId] = useState(null);



    const fetchData = async () => {
        try {
            const userId = '6acc4010-1b7f-403f-9035-832b64e4f66d'; // TODO: Get from auth
            
            // Fetch all jobs và hidden jobs song song
            const [jobsResponse, hiddenResponse] = await Promise.all([
                axios.get(`${api}/getjobs`),
                axios.get(`${api}/getHiddenJobs/${userId}`)
            ]);
            
            const allJobs = jobsResponse.data;
            const hiddenJobIds = hiddenResponse.data.map(hidden => hidden.job_id);
            
            // Filter ra các hidden jobs
            const visibleJobs = allJobs.filter(job => !hiddenJobIds.includes(job.id));
            
            setJobs(visibleJobs);
            setHiddenJobs(hiddenJobIds);
            
        } catch (error) {
            console.error('Error fetching jobs:', error);
            if (error.response?.status === 404) {
                try {
                    const response = await axios.get(`${api}/getjobs`);
                    setJobs(response.data);
                } catch (fallbackError) {
                    console.error('Fallback fetch also failed:', fallbackError);
                }
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (jobs.length === 0) {
                fetchData();
            }
        });

        return unsubscribe;
    }, [navigation, jobs.length]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    const updateJobViews = useCallback((jobId, newViews) => {
        setJobs(prevJobs => 
            prevJobs.map(job => 
                job.id === jobId ? { ...job, views: newViews } : job
            )
        );
    }, []);

    const handleDeleteJob = useCallback(async (jobId) => {
        try {
            const userId = '6acc4010-1b7f-403f-9035-832b64e4f66d'; 
            const response = await axios.post(`${api}/hideJob/${userId}/${jobId}`);
            
            if (response.status === 200 || response.status === 201) {
                setHiddenJobs(prev => [...prev, jobId]);
                setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
                setOpenCardId(null);
                console.log('Job hidden successfully');
            }
        } catch (error) {
            console.error('Error hiding job:', error);
            if (error.response) {
                const message = error.response.data?.error || 'Không thể ẩn công việc';
                alert(`Lỗi: ${message}`);
            } else if (error.request) {
                alert('Lỗi kết nối. Vui lòng kiểm tra internet.');
            } else {
                alert('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    }, []);

    const handleCardSwipe = useCallback((cardId, isOpen) => {
        if (isOpen) {
            setOpenCardId(cardId);
        } else {
            if (openCardId === cardId) {
                setOpenCardId(null);
            }
        }
    }, [openCardId]);

    const renderItem = ({ item }) => (
        <JobCard
            key={item.id}
            job={item}
            isOpen={openCardId === item.id}
            onPress={() => navigation.navigate('JobDetail', { 
                job: item,
                onViewsUpdate: updateJobViews
            })}
            onDelete={handleDeleteJob}
            onSwipe={handleCardSwipe}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={(jobs.filter(job => job.isAccepted))}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={<Text style={styles.header}>Available Jobs</Text>}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1a73e8']}
                        tintColor={'#1a73e8'}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { padding: 16 },
    header: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
});
