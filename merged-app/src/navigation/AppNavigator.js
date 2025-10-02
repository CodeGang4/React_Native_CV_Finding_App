import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../screens/shared/LoadingScreen';
import LoginScreen from '../screens/shared/LoginScreen';
import SignupScreen from '../screens/shared/SignupScreen';
import RoleSelectionScreen from '../screens/shared/RoleSelectionScreen';
import CandidateNavigator from './CandidateNavigator';
import EmployerNavigator from './EmployerNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { user, userRole, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    // Auth screens
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                    </>
                ) : userRole === 'candidate' ? (
                    // Candidate app
                    <Stack.Screen name="CandidateApp" component={CandidateNavigator} />
                ) : userRole === 'employer' ? (
                    // Employer app
                    <Stack.Screen name="EmployerApp" component={EmployerNavigator} />
                ) : (
                    // Fallback to role selection if role is undefined
                    <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}