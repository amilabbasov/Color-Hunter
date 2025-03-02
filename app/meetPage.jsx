import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useContext } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

const MeetPage = () => {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useContext(ThemeContext);
  const [storedName, setStoredName] = React.useState(name);

  useEffect(() => {
    const saveData = async () => {
      try {
        if (name) {
          await AsyncStorage.setItem('meetPageData', JSON.stringify({ name }));
        }
      } catch (error) {
        console.error('Failed to save the data', error);
      }
    };
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('meetPageData');
        if (data) {
          const parsedData = JSON.parse(data);
          setStoredName(parsedData.name);
        }
      } catch (error) {
        console.error('Failed to load the data', error);
      }
    };
    if (!name) {
      loadData();
    } else {
      saveData();
    }
  }, [name]);

  const goToIndexPage = () => {
    router.push('gamePage');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? 'rgba(255, 215, 0, 0.7)' : '#000', textShadowColor: isDarkMode ? 'rgba(255, 215, 0, 0.7)' : 'transparent' }]}>Welcome</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          {storedName || 'Guest'}!
        </Text>
      </View>
      <View style={[styles.content, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
        <Text style={[styles.message, { color: isDarkMode ? 'rgba(255, 215, 0, 0.7)' : '#000' }]}>We're excited to have you here! 🎉</Text>
        <TouchableOpacity style={styles.button} onPress={goToIndexPage}>
          <Text style={styles.buttonText}>Go to Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    alignItems: 'center',
    position: 'absolute',
    flexDirection: 'row',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 30,
  },
  backButtonText: {
    width: 40,
    height: 40,
    tintColor: '#121212',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'rgba(255, 215, 0, 0.7)',
    fontSize: 48,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 215, 0, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '500',
    textShadowColor: 'rgb(255, 255, 255)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  content: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  message: {
    color: 'rgba(255, 215, 0, 0.7)',
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#ff0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default MeetPage;