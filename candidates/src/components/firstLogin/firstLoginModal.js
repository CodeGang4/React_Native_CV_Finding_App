import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

export default function FirstLoginModal({ visible, role, setRole, experience, setExperience, onSubmit }) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Thông tin lần đầu đăng nhập</Text>
                    <Text>Chức vụ của bạn là gì?</Text>
                    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                        <TouchableOpacity style={[styles.roleBtn, role === 'employer' && styles.selectedRole]} onPress={() => setRole('employer')}>
                            <Text>Employer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.roleBtn, role === 'candidate' && styles.selectedRole]} onPress={() => setRole('candidate')}>
                            <Text>Candidate</Text>
                        </TouchableOpacity>
                    </View>
                    <Text>Kinh nghiệm làm việc (năm):</Text>
                    <TextInput
                        style={styles.input}
                        value={experience}
                        onChangeText={setExperience}
                        keyboardType="numeric"
                        placeholder="Nhập số năm kinh nghiệm"
                    />
                    <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gửi thông tin</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 40,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 500,
        minHeight: 320,
        marginHorizontal: 0,
        alignItems: 'center',
        elevation: 8,
    },
    roleBtn: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 8,
        marginHorizontal: 10,
        backgroundColor: '#eee',
    },
    selectedRole: {
        backgroundColor: '#00cc00',
        borderColor: '#00cc00',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
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
