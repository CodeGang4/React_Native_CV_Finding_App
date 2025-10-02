import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, AppState } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../../supabase/config';

const AuthContext = createContext();
const API = Constants.expoConfig.extra.API;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null); // 'candidate' | 'employer'

    // Check for existing session on app start
    useEffect(() => {
        const checkAuthState = async () => {
            try {
                const token = await SecureStore.getItemAsync('user_token');
                const role = await SecureStore.getItemAsync('user_role');
                const userData = await SecureStore.getItemAsync('user_data');
                
                if (token && role && userData) {
                    // Verify token with backend
                    const response = await fetch(`${API}/auth/verify`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok) {
                        const parsedUserData = JSON.parse(userData);
                        setUser(parsedUserData);
                        setUserRole(role);
                    } else {
                        // Token invalid, clear stored data
                        await clearStoredData();
                    }
                }
            } catch (error) {
                console.log('Auth check error:', error);
                await clearStoredData();
            } finally {
                setLoading(false);
            }
        };

        checkAuthState();
    }, []);

    const clearStoredData = async () => {
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('user_role');
        await SecureStore.deleteItemAsync('user_data');
        await SecureStore.deleteItemAsync('user_email');
        await SecureStore.deleteItemAsync('user_password');
    };

    const login = async (email, password, role = 'candidate') => {
        console.log("This is login function with role:", role);
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
                body: JSON.stringify({ email, password, role })
            });

            if (!res) {
                Alert.alert('Network error', 'No response from server');
                return { success: false };
            }

            const data = await res.json();
            
            if (res.ok && data.user) {
                setUser(data.user);
                setUserRole(data.user.role || role); // Use the selected role or fallback to user.role
                
                // Store user data securely
                await SecureStore.setItemAsync('user_token', data.token || 'dummy_token');
                await SecureStore.setItemAsync('user_role', data.user.role || role);
                await SecureStore.setItemAsync('user_data', JSON.stringify(data.user));

                // Ask for FaceID setup
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
                                await SecureStore.setItemAsync('user_role', data.user.role || role);
                                console.log('Credentials and role saved for FaceID');
                            },
                        },
                    ]
                );
                
                return { success: true };
            } else {
                Alert.alert('Login failed', data.message || 'Invalid credentials');
                return { success: false, error: data.message };
            }
        } catch (e) {
            console.error('Login error:', e);
            if (didTimeout) {
                Alert.alert('Error', 'Network request timed out. Kiểm tra lại kết nối hoặc địa chỉ API.');
            } else {
                Alert.alert('Error', e.message || 'Network error');
            }
            return { success: false, error: e.message };
        } finally {
            setLoading(false);
        }
    };

    const loginWithFaceID = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();

            if (!compatible || !enrolled) {
                throw new Error("Device not support FaceID/TouchID");
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Login with FaceID",
            });

            if (result.success) {
                const savedEmail = await SecureStore.getItemAsync('user_email');
                const savedPassword = await SecureStore.getItemAsync('user_password');
                const savedRole = await SecureStore.getItemAsync('user_role') || 'candidate';
                
                if (!savedEmail || !savedPassword) {
                    throw new Error("Chưa có thông tin đăng nhập. Vui lòng đăng nhập bằng tài khoản trước.");
                }

                // Use the regular login function with saved credentials and role
                return await login(savedEmail, savedPassword, savedRole);
            } else {
                throw new Error("FaceID authentication failed");
            }
        } catch (error) {
            Alert.alert('FaceID Error', error.message);
            return { success: false, error: error.message };
        }
    };

    const signup = async (email, password, recheckPassword, userName, role = 'candidate', navigation) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    recheckPassword,
                    username: userName,
                    role: role // Include role in signup
                })
            });

            const data = await res.json();
            console.log('Signup response:', data);
            
            if (res.ok && data.user) {
                Alert.alert('Success', 'Đăng ký thành công! Vui lòng đăng nhập.', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login')
                    }
                ]);
                return { success: true };
            } else {
                Alert.alert('Signup failed', data.error || data.message || 'Could not create account');
                return { success: false, error: data.error || data.message };
            }
        } catch (e) {
            console.error('Signup error:', e);
            Alert.alert('Error', 'Network error');
            return { success: false, error: e.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        setUserRole(null);
        await clearStoredData();
        console.log('User logged out and data cleared');
    };

    const switchRole = async (newRole) => {
        if (user && ['candidate', 'employer'].includes(newRole)) {
            setUserRole(newRole);
            await SecureStore.setItemAsync('user_role', newRole);
            
            // Update user role in backend if needed
            try {
                const token = await SecureStore.getItemAsync('user_token');
                await fetch(`${API}/auth/update-role`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: newRole })
                });
            } catch (error) {
                console.log('Role update error:', error);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            userRole, 
            loading, 
            login, 
            signup, 
            logout, 
            loginWithFaceID,
            switchRole,
            isCandidate: userRole === 'candidate',
            isEmployer: userRole === 'employer'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);