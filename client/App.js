// // import React from "react";
// // import { NavigationContainer } from "@react-navigation/native";
// // import { StatusBar } from "expo-status-bar";
// // import { StyleSheet, View } from "react-native";

// // import MainTabNavigator from "./navigation/MainTabNavigator";

// // export default function App() {
// //   return (
// //     <View style={styles.container}>
// //       <StatusBar style="light" backgroundColor="#00b14f" />
// //       <NavigationContainer>
// //         <MainTabNavigator />
// //       </NavigationContainer>
// //     </View>
// //   );
// // }
// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { StatusBar } from "expo-status-bar";
// import EmployerTabNavigator from "./navigation/EmployerTabNavigator";
// // import MainTabNavigator from "./navigation/MainTabNavigator"; // For regular users

// export default function App() {
//   // Giả sử đây là employer app, nếu cần switch giữa user types:
//   // const userType = "employer"; // or "jobseeker"

//   return (
//     <NavigationContainer>
//       <EmployerTabNavigator />
//       <StatusBar style="auto" />
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
// });

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import EmployerTabNavigator from "./navigation/EmployerTabNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <EmployerTabNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
