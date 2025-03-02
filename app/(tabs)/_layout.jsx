import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
        },
        tabBarActiveTintColor: isDarkMode ? '#FFD700' : '#000000',
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#888',
      }}
    >
      <Tabs.Screen
        name="gamePage"
        options={{
          title: "Game",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}