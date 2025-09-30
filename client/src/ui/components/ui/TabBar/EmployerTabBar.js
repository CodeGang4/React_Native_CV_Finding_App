import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import TabBarItem from "./TabBarItem";
import { ROUTES } from "../../../styles/routes";
import { colors } from "../../../styles/colors";

export default function EmployerTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        const meta = ROUTES[route.name] || {};
        const label = options?.tabBarLabel ?? meta.label ?? route.name;
        const icon = meta.icon ?? "help-outline";
        const badge = options?.tabBarBadge;

        return (
          <TabBarItem
            key={route.key}
            icon={icon}
            label={label}
            active={isFocused}
            badge={badge}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
});
