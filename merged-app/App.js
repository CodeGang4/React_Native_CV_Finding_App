import React from "react";
import { StatusBar } from "expo-status-bar";
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from "./src/shared/contexts/AuthContext";
import AppNavigator from "./src/shared/navigation/AppNavigator";
import { NotificationProvider } from "./src/shared/contexts/NotificationContext";
import Constants from "expo-constants";
// Stripe publishable key - YOUR VALID KEY
const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig.extra.STRIPE_PUBLISHABLE_KEY;


export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <AuthProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
        <StatusBar style="auto" />
      </AuthProvider>
    </StripeProvider>
  );
}
