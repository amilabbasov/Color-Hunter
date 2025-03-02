import { Stack } from "expo-router";
import React, { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    const saveData = async () => {
      try {
        const savedName = await AsyncStorage.getItem('loggedInUser');
        if (savedName) {
          await AsyncStorage.setItem('meetPageData', JSON.stringify({ name: savedName }));
        }
      } catch (error) {
        console.error('Failed to save the data', error);
      }
    };
    saveData();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="meetPage" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}