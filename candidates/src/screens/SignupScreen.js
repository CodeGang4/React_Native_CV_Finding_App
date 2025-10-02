import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
    const { signup, loading } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [recheckPassword, setRecheckPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRecheckPassword, setShowRecheckPassword] = useState(false);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={60}
            >
                <View >
                    <Image source={require('../../assets/topcv_image.png')} style={styles.logo} />
                    <Text style={styles.title}>Chào mừng bạn đến với TopCV</Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    value={username}
                    placeholderTextColor="#888"
                    onChangeText={setUsername}
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
                        placeholder="Nhập lại mật khẩu"
                        placeholderTextColor="#888"
                        value={recheckPassword}
                        onChangeText={setRecheckPassword}
                        secureTextEntry={!showRecheckPassword}
                    />
                    <TouchableOpacity onPress={() => setShowRecheckPassword(!showRecheckPassword)}>
                        <MaterialIcons name={showRecheckPassword ? 'visibility' : 'visibility-off'} size={24} color="#888" />
                    </TouchableOpacity>
                </View>

                <View style={styles.checkboxContainer}>

                    <Text style={styles.checkboxLabel}>Tôi đã đọc và đồng ý với Điều khoản dịch vụ và</Text>
                    <TouchableOpacity>
                        <Text style={styles.link}> Chính sách bảo mật của TopCV.</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => signup(email, password, recheckPassword, username, navigation)} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Đăng ký</Text>
                    )}
                </TouchableOpacity>
                <View style={styles.footer}>
                    <Text>Bạn đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </View>


            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },

    checkboxLabel: {
        fontSize: 12,
        // flex: 1,
        marginBottom: 8,
    },
    passwordContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        marginBottom: 10,
        paddingHorizontal: 10,
        height: 50
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    checkboxContainer: {
        flexDirection: 'column',
        marginBottom: 20,
        fontSize: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    link: {
        color: '#00aaff',
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: '#00cc00',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        textAlign: 'center',
        marginTop: 10,
        color: '#666',
    },
    logo: {
        width: 400,
        height: 100,
        // resizeMode: 'cover',
        marginBottom: 20,

        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        // fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    }
});
