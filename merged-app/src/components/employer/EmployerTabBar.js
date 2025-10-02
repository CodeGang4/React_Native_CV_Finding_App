import React from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const TabBarItem = ({ icon, label, active, badge, onPress, onLongPress }) => {
    return (
        <TouchableOpacity
            style={styles.tabItem}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <MaterialIcons
                    name={icon}
                    size={24}
                    color={active ? '#2196F3' : '#666'}
                />
                {badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            <Text style={[styles.label, { color: active ? '#2196F3' : '#666' }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export default function EmployerTabBar({ state, descriptors, navigation }) {
    const routeIcons = {
        EmployerHome: 'home',
        JobPosting: 'work',
        CandidateList: 'people',
        Notification: 'notifications',
        Account: 'person'
    };

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

                const label = options?.tabBarLabel || route.name;
                const icon = routeIcons[route.name] || 'help-outline';
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
        backgroundColor: '#fff',
        paddingTop: 10,
        paddingBottom: Platform.OS === "ios" ? 28 : 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e0e0e0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 12,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 4,
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ff4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
});