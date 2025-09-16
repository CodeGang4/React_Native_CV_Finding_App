import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet, Image, KeyboardAvoidingView, Platform, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
    const { login, loginWithFaceID, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Hàm xử lý đăng nhập FaceID
    const handleFaceIDLogin = async () => {
        try {
            const { data, error } = await loginWithFaceID();
            if (error) {
                alert(error.message || 'Đăng nhập FaceID thất bại');
                return;
            }
            if (!(data && data.user)) {
                alert('Không lấy được thông tin người dùng sau khi đăng nhập FaceID');
            }
            // Không cần chuyển hướng, navigator sẽ tự động chuyển khi user được cập nhật
        } catch (e) {
            alert(e.message || 'Xác thực FaceID thất bại');
        }
    };

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
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
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
                        textContentType="password"
                        autoComplete="password"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#888" />
                    </TouchableOpacity>
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={{ marginBottom: 13 }} onPress={handleFaceIDLogin}>
                        <Text style={{ fontSize: 14 }}>Đăng nhập bằng FaceID</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginBottom: 13 }} onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={{ fontSize: 14 }}>Quên mật khẩu?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={() => login(email, password)} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Đăng nhập</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text>Bạn chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.link}>Đăng ký ngay</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    ForgetPassword: {
        alignItems: 'flex-end',
        marginTop: 10,
        marginBottom: 10,
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