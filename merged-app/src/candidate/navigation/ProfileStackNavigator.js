import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import CVScreen from "../screens/profile/CVScreen";
import EditProfile from "../screens/profile/EditProfile";
import CVViewer from "../screens/profile/CVViewer";
import UpgradeAccount from "../screens/profile/UpgradeAccount";
import AppliedJobs from "../screens/profile/AppliedJobs";
import SaveJobs from "../screens/profile/SaveJobs";
import JobDetailScreen from "../screens/home/JobDetail";
import PaymentSuccessScreen from "../../shared/screens/payment/PaymentSuccessScreen";
import PaymentFailedScreen from "../../shared/screens/payment/PaymentFailedScreen";
import PaymentHistoryScreen from "../../shared/screens/payment/PaymentHistoryScreen";
import NativePaymentScreen from "../../shared/screens/payment/NativePaymentScreen";
import { useDeepLinking } from "../../shared/services/DeepLinkService";

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  // Setup deep linking handler
  useDeepLinking();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Hồ sơ cá nhân" }}
      />
      <Stack.Screen
        name="CVScreen"
        component={CVScreen}
        options={{
          title: "CV của bạn",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="CVViewer"
        component={CVViewer}
        options={{
          title: "CV của bạn",
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="UpgradeAccount" 
        component={UpgradeAccount} 
        options={{ 
          title: "Nâng cấp tài khoản",
          headerShown: false
        }} 
      />
      <Stack.Screen
        name="NativePayment"
        component={NativePaymentScreen}
        options={{ 
          title: "Thanh toán",
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfile} 
        options={{ 
          title: "Chỉnh sửa hồ sơ",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="AppliedJobs"
        component={AppliedJobs}
        options={{ title: "Việc làm đã ứng tuyển", headerShown: true }}
      />
      <Stack.Screen
        name="SaveJobs"
        component={SaveJobs}
        options={{ title: "Việc làm đã lưu", headerShown: true }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: "Chi tiết công việc" }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{ 
          title: "Thanh toán thành công",
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back
        }}
      />
      <Stack.Screen
        name="PaymentFailed"
        component={PaymentFailedScreen}
        options={{ 
          title: "Thanh toán thất bại",
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{ 
          title: "Lịch sử thanh toán",
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
