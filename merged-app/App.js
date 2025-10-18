import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/shared/contexts/AuthContext";
import AppNavigator from "./src/shared/navigation/AppNavigator";
import { NotificationProvider } from "./src/shared/contexts/NotificationContext";
// import { debugUtils } from "./src/shared/utils/DebugUtils";

// // Initialize debug utilities in development
// if (__DEV__) {
//   debugUtils.exposeGlobalDebug();
// }

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppNavigator />
      </NotificationProvider>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
