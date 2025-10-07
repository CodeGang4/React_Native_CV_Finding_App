import React,{useState , useEffect, useCallback} from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import JobCard from '../components/JobCard';
import axios from "axios"
const api = 'http://172.20.10.10:3000/job'

export default function HomeScreen({ navigation }) {
    const [jobs,setJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${api}/getjobs`);
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Refresh data khi màn hình được focus (user quay lại từ JobDetail)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Chỉ fetch lại nếu jobs array rỗng hoặc cần refresh toàn bộ
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

    const renderItem = ({ item }) => (
        <JobCard
            key={item.id}
            job={item}
            onPress={() => navigation.navigate('JobDetail', { 
                job: item,
                onViewsUpdate: updateJobViews
            })}
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
