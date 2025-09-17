// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { View, Text, StyleSheet, Platform } from "react-native";
// import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";

// import HomePage from "../pages/HomePage/HomePage";
// import EmployerAccountPage from "../pages/AccountPage/pages/EmployerAccountPage";

// const Tab = createBottomTabNavigator();

// // Placeholder components cho các tabs khác
// const CVPage = () => (
//   <View style={styles.placeholder}>
//     <Text style={styles.placeholderText}>Đăng tin</Text>
//   </View>
// );

// const ConnectPage = () => (
//   <View style={styles.placeholder}>
//     <Text style={styles.placeholderText}>Top Connect</Text>
//   </View>
// );

// const NotificationPage = () => (
//   <View style={styles.placeholder}>
//     <Text style={styles.placeholderText}>Thông báo</Text>
//   </View>
// );

// function TabBarIcon({ routeName, focused }) {
//   const iconColor = focused ? "#00b14f" : "#999";
//   const iconSize = 28; // Tăng size icon

//   switch (routeName) {
//     case "Home":
//       return <MaterialIcons name="home" size={iconSize} color={iconColor} />;
//     case "CV":
//       return <FontAwesome name="file-text" size={iconSize} color={iconColor} />;
//     case "Connect":
//       return <Ionicons name="people" size={iconSize} color={iconColor} />;
//     case "Notification":
//       return (
//         <Ionicons name="notifications" size={iconSize} color={iconColor} />
//       );
//     case "Account":
//       return <MaterialIcons name="person" size={iconSize} color={iconColor} />;
//     default:
//       return null;
//   }
// }

// export default function MainTabNavigator() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused }) => (
//           <TabBarIcon routeName={route.name} focused={focused} />
//         ),
//         tabBarActiveTintColor: "#00b14f",
//         tabBarInactiveTintColor: "#999",
//         tabBarStyle: {
//           backgroundColor: "white",
//           borderTopWidth: 1,
//           borderTopColor: "#e0e0e0",
//           height: Platform.OS === "ios" ? 100 : 85, // Tăng chiều cao
//           paddingBottom: Platform.OS === "ios" ? 25 : 15, // Khoảng cách với cạnh dưới
//           paddingTop: 12,
//           paddingHorizontal: 8,
//           // Thêm shadow
//           shadowColor: "#000",
//           shadowOffset: {
//             width: 0,
//             height: -2,
//           },
//           shadowOpacity: 0.1,
//           shadowRadius: 4,
//           elevation: 8,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12, // Tăng font size
//           fontWeight: "600",
//           marginTop: 4,
//         },
//         headerShown: false,
//       })}
//     >
//       <Tab.Screen
//         name="Home"
//         component={HomePage}
//         options={{
//           tabBarLabel: "Trang chủ",
//           tabBarBadge: undefined,
//         }}
//       />
//       <Tab.Screen
//         name="CV"
//         component={CVPage}
//         options={{
//           tabBarLabel: "Tạo & Sửa CV",
//         }}
//       />
//       <Tab.Screen
//         name="Connect"
//         component={ConnectPage}
//         options={{
//           tabBarLabel: "Top Connect",
//         }}
//       />
//       <Tab.Screen
//         name="Notification"
//         component={NotificationPage}
//         options={{
//           tabBarLabel: "Thông báo",
//           tabBarBadge: 1, 
//         }}
//       />
//       <Tab.Screen
//         name="Account"
//         component={EmployerAccountPage}
//         options={{
//           tabBarLabel: "Tài khoản",
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// const styles = StyleSheet.create({
//   placeholder: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   placeholderText: {
//     fontSize: 18,
//     color: "#666",
//     fontWeight: "500",
//   },
// });
