import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ThemeContext } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const Settings = () => {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const router = useRouter();

    const confirmLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Log Out",
                    onPress: logout
                }
            ],
            { cancelable: true }
        );
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            await AsyncStorage.removeItem('loggedInUser');
            router.push('/');
        } catch (error) {
            console.error('Failed to delete the token', error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
            <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>Settings</Text>
            <TouchableOpacity style={styles.button} onPress={toggleTheme}>
                <Text style={styles.buttonText}>{isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
                <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#FFD700",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        width: '80%',
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: "#FF4500",
        padding: 15,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: "#000",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Settings;
