import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { ThemeContext } from '../context/ThemeContext';

const index = () => {
  const [colorIndex, setColorIndex] = useState(0);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const colors = ['#99ffb4', '#ff619e', '#5cb0ff', '#FFD700', '#DA70D6'];
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          const savedName = await AsyncStorage.getItem('loggedInUser');
          if (savedName) {
            router.push({ pathname: 'meetPage', params: { name: savedName } });
          }
        }
      } catch (error) {
        console.error('Failed to load the token', error);
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    const checkAccounts = async () => {
      try {
        const savedAccounts = await AsyncStorage.getItem('accounts');
        if (!savedAccounts || JSON.parse(savedAccounts).length === 0) {
          setIsSignUp(true);
        }
      } catch (error) {
        console.error('Failed to load the accounts', error);
      }
    };
    checkAccounts();
  }, []);

  const saveNameAndPassword = async () => {
    if (name.trim() === '' || password.trim() === '') {
      alert('Please enter your name and password');
      return;
    }
    try {
      const savedAccounts = await AsyncStorage.getItem('accounts');
      const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
      accounts.push({ name });
      await AsyncStorage.setItem('accounts', JSON.stringify(accounts));
      await SecureStore.setItemAsync(name, password);
      await AsyncStorage.setItem('loggedInUser', name);
      router.push({ pathname: 'meetPage', params: { name } });
    } catch (error) {
      console.error('Failed to save the name or password', error);
    }
  };

  const handleNameChange = (text) => {
    const lettersOnly = text.replace(/[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0259]/g, '');
    if (text !== lettersOnly) {
      setError('Please enter only letters without spaces.');
    } else {
      setError('');
    }
    setName(lettersOnly);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
  };

  const login = async () => {
    try {
      const savedAccounts = await AsyncStorage.getItem('accounts');
      if (savedAccounts) {
        const accounts = JSON.parse(savedAccounts);
        const account = accounts.find(acc => acc.name === name);
        if (account) {
          const savedPassword = await SecureStore.getItemAsync(name);
          if (savedPassword === password) {
            const token = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, name + password);
            await SecureStore.setItemAsync('userToken', token);
            await AsyncStorage.setItem('loggedInUser', name);
            setIsLoggedIn(true);
            router.push({ pathname: 'meetPage', params: { name: account.name } });
          } else {
            Alert.alert('Incorrect Password');
          }
        } else {
          Alert.alert('Incorrect Name');
        }
      }
    } catch (error) {
      console.error('Failed to retrieve the credentials', error);
    }
  };

  const createNewSignUp = () => {
    setIsSignUp(true);
    setName('');
    setPassword('');
  };

  const goToLogin = () => {
    setIsSignUp(false);
    setName('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}
      behavior={Platform.OS === 'ios' ? '100' : '0'}
      keyboardVerticalOffset={50}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? '#ff0' : '#000' }]}>GAME WITH</Text>
          <View style={{ flexDirection: 'row' }}>
            {['C', 'O', 'L', 'O', 'R', 'S'].map((letter, index) => (
              <Text key={index} style={[styles.title, { color: colors[index % colors.length], textShadowColor: isDarkMode ? '#ff0' : 'transparent' }]}>
                {letter}
              </Text>
            ))}
          </View>
        </View>
        {isSignUp ? (
          <>
            <TextInput
              placeholder='Name...'
              placeholderTextColor='#adadad'
              style={[styles.input, styles.leftPlaceholder, { backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000' }]}
              keyboardType='default'
              value={name}
              onChangeText={handleNameChange}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={[styles.passwordContainer, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
              <TextInput
                placeholder='Password...'
                placeholderTextColor='#adadad'
                style={[styles.passwordInput, { color: isDarkMode ? '#fff' : '#000' }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#adadad" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={saveNameAndPassword}>
              <Text style={[styles.buttonText, { color: colors[colorIndex] }]}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.textButton} onPress={goToLogin}>
              <Text style={[styles.buttonText, { color: colors[colorIndex] }]}>You already have an account?</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder='Name...'
              placeholderTextColor='#adadad'
              style={[styles.input, styles.leftPlaceholder, { backgroundColor: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#000' }]}
              keyboardType='default'
              value={name}
              onChangeText={handleNameChange}
            />
            <View style={[styles.passwordContainer, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
              <TextInput
                placeholder='Password...'
                placeholderTextColor='#adadad'
                style={[styles.passwordInput, { color: isDarkMode ? '#fff' : '#000' }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#adadad" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={login}>
              <Text style={[styles.buttonText, { color: colors[colorIndex] }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.textButton} onPress={createNewSignUp}>
              <Text style={[styles.buttonText, { color: colors[colorIndex] }]}>Create New Account</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#adadad',
    borderRadius: 20,
    height: 60,
    width: 200,
    textAlign: 'left',
    marginTop: 20,
    paddingHorizontal: 10,
    fontSize: 18,
    textShadowColor: '#ff0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  leftPlaceholder: {
    textAlign: 'left',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#adadad',
    borderRadius: 20,
    height: 60,
    width: 200,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#ff0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  textButton: {
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
  },
  themeButton: {
    position: 'absolute',
    top: 40,
    right: 10,
    padding: 10,
  },
});

export default index