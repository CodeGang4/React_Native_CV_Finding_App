
import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication'
import { AppState } from 'react-native';
const AuthContext = createContext();
const API = Constants.expoConfig.extra.API;
import { supabase } from '../../supabase/config';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Đã tạm thời tắt logic xóa dữ liệu khi app chuyển background/inactive để kiểm tra lỗi FaceID

    const login = async (email, password) => {
        console.log("This is login function");
        setLoading(true);
        let didTimeout = false;
        try {
            // Thiết lập timeout cho fetch
            const fetchWithTimeout = (url, options, timeout = 10000) => {
                return Promise.race([
                    fetch(url, options),
                    new Promise((_, reject) => setTimeout(() => {
                        didTimeout = true;
                        reject(new Error('Request timed out'));
                    }, timeout))
                ]);
            };
            const res = await fetchWithTimeout(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res) {
                Alert.alert('Network error', 'No response from server');
                return;
            }
            const data = await res.json();
            if (res.ok && data.user) {
                setUser(data.user);
                Alert.alert(
                    'Sử dụng FaceID',
                    'Bạn có muốn lưu thông tin để đăng nhập bằng FaceID cho lần sau?',
                    [
                        {
                            text: 'Không',
                            style: 'cancel',
                            onPress: async () => {
                                await SecureStore.deleteItemAsync('user_email');
                                await SecureStore.deleteItemAsync('user_password');
                                console.log('SecureStore cleared by user choice');
                            }
                        },
                        {
                            text: 'Có',
                            onPress: async () => {
                                await SecureStore.setItemAsync('user_email', email);
                                await SecureStore.setItemAsync('user_password', password);
                                const logEmail = await SecureStore.getItemAsync('user_email');
                                const logPassword = await SecureStore.getItemAsync('user_password');
                                console.log('SecureStore after login:', { logEmail, logPassword });
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Login failed', data.message || 'Invalid credentials');
            }
        } catch (e) {
            console.error('Login error:', e);
            if (didTimeout) {
                Alert.alert('Error', 'Network request timed out. Kiểm tra lại kết nối hoặc địa chỉ API.');
            } else {
                Alert.alert('Error', e.message || 'Network error');
            }
        } finally {
            setLoading(false);
        }
    };
    async function loginWithFaceID(email, password) {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (!compatible || !enrolled) {
            throw new Error("Device not support FaceID/TouchID");
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Login with FaceID",
        });

        // Log dữ liệu trước khi đăng nhập FaceID
        const savedEmail = await SecureStore.getItemAsync('user_email');
        const savedPassword = await SecureStore.getItemAsync('user_password');
        console.log('FaceID login:', { savedEmail, savedPassword });

        if (result.success) {
            if (!savedEmail || !savedPassword) {
                throw new Error("Chưa có thông tin đăng nhập. Vui lòng đăng nhập bằng tài khoản trước.");
            }
            const { data, error } = await supabase.auth.signInWithPassword({
                email: savedEmail,
                password: savedPassword,
            });
            if (data && data.user) {
                setUser(data.user);
            }
            return { data, error };
        } else {
            throw new Error("FaceID failed");
        }
    }

    const signup = async (email, password, recheckPassword, userName) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    recheckPassword,
                    username: userName // Backend expects 'username', not 'userName'
                })
            });
            const data = await res.json();
            console.log('Signup response:', data); // Add logging to see the actual error
            if (res.ok && data.user) {
                setUser(data.user);
                Alert.alert('Success', 'Account created successfully!');
            } else {
                Alert.alert('Signup failed', data.error || data.message || 'Could not create account');
            }
        } catch (e) {
            console.error('Signup error:', e);
            Alert.alert('Error', 'Network error');
        }
        setLoading(false);
    };

    const logout = async () => {
        setUser(null);
        // Log dữ liệu trong SecureStore khi logout
        const logEmail = await SecureStore.getItemAsync('user_email');
        const logPassword = await SecureStore.getItemAsync('user_password');
        console.log('SecureStore after logout:', { logEmail, logPassword });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithFaceID }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
