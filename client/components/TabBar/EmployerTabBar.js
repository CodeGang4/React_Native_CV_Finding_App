// // import React from "react";
// // import {
// //   View,
// //   TouchableOpacity,
// //   Text,
// //   StyleSheet,
// //   Platform,
// // } from "react-native";
// // import { MaterialIcons } from "@expo/vector-icons";

// // const EmployerTabBar = ({ state, descriptors, navigation }) => {
// //   const getTabIcon = (routeName, isFocused) => {
// //     let iconName;

// //     switch (routeName) {
// //       case "Home":
// //         iconName = "home";
// //         break;
// //       case "JobPosting":
// //         iconName = "work";
// //         break;
// //       case "Connect":
// //         iconName = "people";
// //         break;
// //       case "Notification":
// //         iconName = "notifications";
// //         break;
// //       case "Account":
// //         iconName = "person";
// //         break;
// //       default:
// //         iconName = "help";
// //     }

// //     return (
// //       <MaterialIcons
// //         name={iconName}
// //         size={28}
// //         color={isFocused ? "#4CAF50" : "#666"}
// //       />
// //     );
// //   };

// //   const getTabLabel = (routeName) => {
// //     switch (routeName) {
// //       case "Home":
// //         return "Trang chủ";
// //       case "JobPosting":
// //         return "Tuyển dụng";
// //       case "Connect":
// //         return "Ứng viên";
// //       case "Notification":
// //         return "Thông báo";
// //       case "Account":
// //         return "Tài khoản";
// //       default:
// //         return routeName;
// //     }
// //   };

// //   return (
// //     <View style={styles.tabBar}>
// //       {state.routes.map((route, index) => {
// //         const { options } = descriptors[route.key];
// //         const isFocused = state.index === index;

// //         const onPress = () => {
// //           const event = navigation.emit({
// //             type: "tabPress",
// //             target: route.key,
// //             canPreventDefault: true,
// //           });

// //           if (!isFocused && !event.defaultPrevented) {
// //             navigation.navigate(route.name);
// //           }
// //         };

// //         return (
// //           <TouchableOpacity
// //             key={route.key}
// //             onPress={onPress}
// //             style={styles.tabItem}
// //             activeOpacity={0.7}
// //           >
// //             {getTabIcon(route.name, isFocused)}
// //             <Text
// //               style={[
// //                 styles.tabLabel,
// //                 { color: isFocused ? "#4CAF50" : "#666" },
// //               ]}
// //             >
// //               {getTabLabel(route.name)}
// //             </Text>
// //           </TouchableOpacity>
// //         );
// //       })}
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   tabBar: {
// //     flexDirection: "row",
// //     backgroundColor: "#fff",
// //     paddingVertical: 8,
// //     paddingBottom: Platform.OS === "ios" ? 25 : 15,
// //     paddingTop: 12,
// //     borderTopWidth: 1,
// //     borderTopColor: "#e0e0e0",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 8,
// //     height: Platform.OS === "ios" ? 100 : 85,
// //   },
// //   tabItem: {
// //     flex: 1,
// //     alignItems: "center",
// //     paddingVertical: 4,
// //   },
// //   tabLabel: {
// //     fontSize: 12,
// //     marginTop: 4,
// //     fontWeight: "600",
// //     textAlign: "center",
// //   },
// // });

// // export default EmployerTabBar;
// import React from "react";
// import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";

// const ACTIVE_COLOR = "#30C36B";
// const INACTIVE_COLOR = "#666";

// const iconByRoute = {
//   Home: "home",
//   JobPosting: "work",
//   Connect: "people",
//   Notification: "notifications-none",
//   Account: "person",
// };

// const labelByRoute = {
//   Home: "Trang chủ",
//   JobPosting: "Tuyển dụng",
//   Connect: "Ứng viên",
//   Notification: "Thông báo",
//   Account: "Tài khoản",
// };

// const EmployerTabBar = ({ state, descriptors, navigation }) => {
//   return (
//     <View style={styles.container}>
//       {state.routes.map((route, index) => {
//         const isFocused = state.index === index;
//         const { options } = descriptors[route.key];

//         const onPress = () => {
//           const event = navigation.emit({
//             type: "tabPress",
//             target: route.key,
//             canPreventDefault: true,
//           });
//           if (!isFocused && !event.defaultPrevented) {
//             navigation.navigate(route.name);
//           }
//         };

//         const onLongPress = () => {
//           navigation.emit({ type: "tabLongPress", target: route.key });
//         };

//         const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
//         const label =
//           options?.tabBarLabel ?? labelByRoute[route.name] ?? route.name;
//         const iconName = iconByRoute[route.name] ?? "help-outline";
//         const badge = options?.tabBarBadge;

//         return (
//           <Pressable
//             key={route.key}
//             onPress={onPress}
//             onLongPress={onLongPress}
//             style={({ pressed }) => [
//               styles.item,
//               pressed && styles.itemPressed,
//             ]}
//             android_ripple={{ color: "rgba(0,0,0,0.08)" }}
//             hitSlop={8}
//           >
//             <View style={styles.iconWrap}>
//               <MaterialIcons name={iconName} size={26} color={color} />
//               {typeof badge === "number" && badge > 0 && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>
//                     {badge > 99 ? "99+" : badge}
//                   </Text>
//                 </View>
//               )}
//             </View>
//             <Text numberOfLines={1} style={[styles.label, { color }]}>
//               {label}
//             </Text>
//           </Pressable>
//         );
//       })}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     paddingTop: 10,
//     paddingBottom: Platform.OS === "ios" ? 28 : 12,
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: "#e5e7eb",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 12,
//   },
//   item: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   itemPressed: {
//     opacity: 0.9,
//   },
//   iconWrap: {
//     position: "relative",
//     height: 28,
//     justifyContent: "center",
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 4,
//   },
//   badge: {
//     position: "absolute",
//     right: -10,
//     top: -6,
//     backgroundColor: "#EF4444",
//     borderRadius: 10,
//     minWidth: 18,
//     height: 18,
//     paddingHorizontal: 4,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badgeText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "700",
//   },
// });

// export default EmployerTabBar;
