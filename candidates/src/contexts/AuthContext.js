import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
const AuthContext = createContext();
const API = Constants.expoConfig.extra.API;
console.log(`${API}/auth/login`);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setUser(data.user);
            } else {
                Alert.alert('Login failed', data.message || 'Invalid credentials');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Network error');
        }
        setLoading(false);
    };

    const signup = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setUser(data.user);
            } else {
                Alert.alert('Signup failed', data.message || 'Could not create account');
            }
        } catch (e) {
            Alert.alert('Error', 'Network error');
        }
        setLoading(false);
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
