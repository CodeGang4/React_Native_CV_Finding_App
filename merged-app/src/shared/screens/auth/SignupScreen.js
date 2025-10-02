import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
    const { signup, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('candidate'); // Default to candidate
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword || !userName) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        const result = await signup(email, password, confirmPassword, userName, userRole, navigation);
        if (result.success) {
            // Success message handled in signup function
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Đăng ký tài khoản</Text>
            
            {/* Role Selection */}
            <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Bạn là:</Text>
                <View style={styles.roleButtons}>
                    <TouchableOpacity
                        style={[styles.roleButton, userRole === 'candidate' && styles.roleButtonActive]}
                        onPress={() => setUserRole('candidate')}
                    >
                        <MaterialIcons 
                            name="person-search" 
                            size={24} 
                            color={userRole === 'candidate' ? '#fff' : '#00b14f'} 
                        />
                        <Text style={[styles.roleButtonText, userRole === 'candidate' && styles.roleButtonTextActive]}>
                            Người tìm việc
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.roleButton, userRole === 'employer' && styles.roleButtonActive]}
                        onPress={() => setUserRole('employer')}
                    >
                        <MaterialIcons 
                            name="business" 
                            size={24} 
                            color={userRole === 'employer' ? '#fff' : '#2196F3'} 
                        />
                        <Text style={[styles.roleButtonText, userRole === 'employer' && styles.roleButtonTextActive]}>
                            Nhà tuyển dụng
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={userName}
                onChangeText={setUserName}
                placeholderTextColor="#888"
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
                <TextInput
                    style={{ flex: 1 }}
                    placeholder="Mật khẩu"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#888"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#888" />
                </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
                <TextInput
                    style={{ flex: 1 }}
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#888"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <MaterialIcons name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={24} color="#888" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
                <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Đăng nhập ngay</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    roleContainer: {
        marginBottom: 20,
    },
    roleLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    roleButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 10,
        marginHorizontal: 5,
        backgroundColor: '#fff',
    },
    roleButtonActive: {
        backgroundColor: '#00b14f',
        borderColor: '#00b14f',
    },
    roleButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    roleButtonTextActive: {
        color: '#fff',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 50,
    },
    button: {
        backgroundColor: '#00cc00',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    link: {
        color: '#00aaff',
        textDecorationLine: 'underline',
    },
});