import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePage from "../pages/HomePage/HomePage";
import EmployerAccountPage from "../pages/AccountPage/pages/EmployerAccountPage";
import CVManagePage from "../pages/CVManagePage/CVManagePage";
import NotificationPage from "../pages/NotificationPage/NotificationPage";
import ConnectPage from "../pages/ConnectPage/ConnectPage";
import EmployerTabBar from "../components/TabBar/TabBar";

const Tab = createBottomTabNavigator();

export default function EmployerTabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <EmployerTabBar {...props} />}>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="CV"
        component={CVManagePage}
        options={{
          headerShown: false,
          tabBarLabel: "Jobs",
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectPage}
        options={{
          headerShown: false,
          tabBarLabel: "Candidates",
        }}
      />
      <Tab.Screen name="Notification" component={NotificationPage} />
      <Tab.Screen
        name="Account"
        component={EmployerAccountPage}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
