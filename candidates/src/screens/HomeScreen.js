import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import FirstLoginModal from '../components/firstLogin/firstLoginModal';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';
const API = Constants.expoConfig.extra.API;

export default function HomeScreen() {
    const { user, logout } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [role, setRole] = useState('');
    const [experience, setExperience] = useState('');
    useEffect(() => {
        if (user && user.isFirstLogin) {
            setShowModal(true);
        }
    }, [user]);

    const handleSubmit = async () => {
        // Gửi dữ liệu lên backend
        try {
            // Ví dụ API cập nhật thông tin user
            const res = await fetch(`${API}/client/user/updateUserRole`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    role,
                    experience,
                })

            });

            if (res.ok) {
                // Cập nhật thông tin thành công
                const data = await res.json();
                console.log('Cập nhật thông tin thành công:', data);
            } else {
                // Xử lý lỗi
                console.error('Cập nhật thông tin thất bại');
            }

        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
        }
    }

    return (
        <View>
            <Text>Welcome to the Home Screen</Text>
            <Button title="Logout" onPress={logout} />
            <Text>User Info: {user ? JSON.stringify(user) : 'No user logged in'}</Text>
            <Text>First Login: {user && user.isFirstLogin ? 'Yes' : 'No'}</Text>
            <FirstLoginModal
                visible={showModal}
                role={role}
                setRole={setRole}
                experience={experience}
                setExperience={setExperience}
                onSubmit={handleSubmit}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, marginBottom: 20 },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 40,
    },
    modalContent: {
        padding: 10,
        marginVertical: 10,
        width: '100%',
    },
    submitBtn: {
        backgroundColor: '#00cc00',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        width: '100%',
    },
});
