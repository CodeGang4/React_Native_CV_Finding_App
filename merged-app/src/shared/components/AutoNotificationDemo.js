import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import JobNotificationHelper from '../utils/JobNotificationHelper.js';

const AutoNotificationDemo = () => {
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState('test-user-123');
  const [testEmployerId, setTestEmployerId] = useState('employer-456');

  const testAutoNotifications = [
    {
      title: '🔥 Test Job Posted Notification',
      description: 'Gửi thông báo tự động khi employer đăng job mới',
      onPress: async () => {
        try {
          setLoading(true);
          const jobData = {
            id: 'job-' + Date.now(),
            title: 'React Native Developer',
            company: 'TechCorp',
            location: 'Hà Nội',
            salary: '20-30 triệu',
            employerId: testEmployerId,
            employerName: 'HR Manager'
          };

          await JobNotificationHelper.autoNotifyJobPosted(jobData);
          Alert.alert('✅ Success', 'Job posted notification sent!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: '👋 Test New User Welcome',
      description: 'Gửi thông báo chào mừng user mới đăng ký',
      onPress: async () => {
        try {
          setLoading(true);
          const userData = {
            id: testUserId,
            name: 'Nguyễn Văn A',
            role: 'candidate',
            email: 'test@example.com'
          };

          await JobNotificationHelper.autoNotifyNewUserWelcome(userData);
          Alert.alert('✅ Success', 'Welcome notification sent!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: '📧 Test Email Verified',
      description: 'Gửi thông báo khi user verify email thành công',
      onPress: async () => {
        try {
          setLoading(true);
          await JobNotificationHelper.autoNotifyEmailVerified(testUserId, 'candidate');
          Alert.alert('✅ Success', 'Email verified notification sent!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: '📝 Test Profile Incomplete',
      description: 'Gửi thông báo nhắc nhở hoàn thiện profile',
      onPress: async () => {
        try {
          setLoading(true);
          await JobNotificationHelper.autoNotifyProfileIncomplete(testUserId, 'candidate');
          Alert.alert('✅ Success', 'Profile incomplete notification sent!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: '💼 Test Job Application',
      description: 'Gửi thông báo khi có ứng viên apply job (tới employer)',
      onPress: async () => {
        try {
          setLoading(true);
          await JobNotificationHelper.autoNotifyJobApplication(
            testEmployerId,
            'Nguyễn Văn B',
            'Frontend Developer',
            {
              application_id: 'app-' + Date.now(),
              candidate_id: testUserId,
              job_id: 'job-123'
            }
          );
          Alert.alert('✅ Success', 'Job application notification sent to employer!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: '🎉 Test Application Accepted',
      description: 'Gửi thông báo khi đơn ứng tuyển được chấp nhận',
      onPress: async () => {
        try {
          setLoading(true);
          await JobNotificationHelper.autoNotifyApplicationStatus(
            testUserId,
            'accepted',
            'Full Stack Developer',
            {
              employer_name: 'ABC Company',
              next_steps: 'Chúng tôi sẽ liên hệ với bạn trong 2-3 ngày tới'
            }
          );
          Alert.alert('✅ Success', 'Application accepted notification sent!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: '📅 Test Interview Invitation',
      description: 'Gửi thông báo mời phỏng vấn',
      onPress: async () => {
        try {
          setLoading(true);
          await JobNotificationHelper.autoNotifyApplicationStatus(
            testUserId,
            'interview',
            'Backend Developer',
            {
              interview_date: '2024-01-15',
              interview_time: '14:00',
              interview_location: 'Tầng 5, Tòa nhà ABC'
            }
          );
          Alert.alert('✅ Success', 'Interview invitation sent!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: '😔 Test Application Rejected',
      description: 'Gửi thông báo khi đơn ứng tuyển bị từ chối',
      onPress: async () => {
        try {
          setLoading(true);
          await JobNotificationHelper.autoNotifyApplicationStatus(
            testUserId,
            'rejected',
            'DevOps Engineer',
            {
              feedback: 'Cảm ơn bạn đã quan tâm. Chúng tôi sẽ lưu hồ sơ cho các cơ hội khác.'
            }
          );
          Alert.alert('✅ Success', 'Application rejected notification sent!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    },
    {
      title: '🌟 Test Daily Reminder',
      description: 'Gửi thông báo nhắc nhở hàng ngày',
      onPress: async () => {
        try {
          setLoading(true);
          await JobNotificationHelper.autoNotifyDailyReminder(testUserId, 'candidate');
          Alert.alert('✅ Success', 'Daily reminder sent!');
        } catch (error) {
          Alert.alert('❌ Error', error.message);
        } finally {
          setLoading(false);
        }
      }
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔥 Auto Notification Testing</Text>
      <Text style={styles.subtitle}>Test các notification tự động trong app</Text>

      {/* User ID Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Test User ID (Candidate):</Text>
        <TextInput
          style={styles.input}
          value={testUserId}
          onChangeText={setTestUserId}
          placeholder="Enter user ID..."
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Test Employer ID:</Text>
        <TextInput
          style={styles.input}
          value={testEmployerId}
          onChangeText={setTestEmployerId}
          placeholder="Enter employer ID..."
        />
      </View>

      {/* Test Buttons */}
      {testAutoNotifications.map((test, index) => (
        <View key={index} style={styles.testItem}>
          <Text style={styles.testTitle}>{test.title}</Text>
          <Text style={styles.testDescription}>{test.description}</Text>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={test.onPress}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Test Now'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Thông tin</Text>
        <Text style={styles.infoText}>
          • Các notification này sẽ được gửi tự động trong app
        </Text>
        <Text style={styles.infoText}>
          • Check backend console để xem log chi tiết
        </Text>
        <Text style={styles.infoText}>
          • Notification sẽ được lưu vào database
        </Text>
        <Text style={styles.infoText}>
          • User sẽ nhận được push notification (nếu enable)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  testItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#e7f3ff',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    lineHeight: 18,
  },
});

export default AutoNotificationDemo;