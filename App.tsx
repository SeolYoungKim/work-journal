import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import RecordsScreen from "./src/screens/RecordsScreen";
import {
  registerForPushNotifications,
  scheduleDailyReminder,
} from "./src/utils/notifications";

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>{label}</Text>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      await registerForPushNotifications();
      await scheduleDailyReminder();
    })();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#F8F9FA", elevation: 0, shadowOpacity: 0 },
          headerTitleStyle: { fontWeight: "700", fontSize: 18, color: "#1A1A2E" },
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#4A6CF7",
          tabBarInactiveTintColor: "#999",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "기록하기",
            tabBarIcon: ({ focused }) => (
              <TabIcon label="✏️" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Records"
          component={RecordsScreen}
          options={{
            title: "기록 목록",
            tabBarIcon: ({ focused }) => (
              <TabIcon label="📋" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
