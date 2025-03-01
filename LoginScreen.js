import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, exchangeCodeAsync } from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

// Microsoft App Details
const clientId = '68a4e767-34b2-41e5-b4c7-59578dae21b8';
const tenantId = '1de61f46-fc12-4067-ab1d-147eb7e21025';
const redirectUri = 'exp://192.168.1.14:8082'; // Update this to match your Expo URL

// Discovery Endpoint
const discovery = {
  authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
};

export default function LoginScreen() {
  const navigation = useNavigation(); // Ensure navigation is available
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true); // Start with loading to check token

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      scopes: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
      redirectUri,
    },
    discovery
  );

  // Memoize validateToken to ensure navigation is available
  const validateToken = useCallback(async (token) => {
    setLoading(true);
    try {
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userInfoResponse.ok) {
        const userData = await userInfoResponse.json();
        setUserInfo(userData);
        if (navigation) {
          navigation.replace('MainTab'); // Updated to navigate to MainTab (stack screen name)
        } else {
          console.error('Navigation is not available during token validation');
          setErrorMessage('Navigation error occurred. Please try again.');
          setLoading(false);
        }
      } else {
        // Token is invalid or expired, clear it and show login
        await AsyncStorage.removeItem('accessToken');
        setToken(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      await AsyncStorage.removeItem('accessToken');
      setToken(null);
      setLoading(false);
      setErrorMessage('Failed to validate token. Please try again.');
    }
  }, [navigation]); // Add navigation as a dependency

  // Check for existing token on mount
  useEffect(() => {
    const checkExistingToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('accessToken');
        if (storedToken) {
          setToken(storedToken);
          await validateToken(storedToken);
        } else {
          setLoading(false); // No token, show login UI
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setLoading(false); // Fallback to login UI
        setErrorMessage('Error loading token. Please try again.');
      }
    };
    checkExistingToken();
  }, [validateToken]); // Use validateToken as dependency instead of raw function

  useEffect(() => {
    if (response?.type === 'success') {
      const getToken = async () => {
        setLoading(true);
        try {
          const result = await exchangeCodeAsync(
            {
              code: response.params.code,
              clientId,
              redirectUri,
              extraParams: { code_verifier: request.codeVerifier },
            },
            discovery
          );

          setToken(result.accessToken);
          console.log('Received Access Token:', result.accessToken); // Log the token

          // Fetch User Info
          const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${result.accessToken}` },
          });
          const userData = await userInfoResponse.json();
          setUserInfo(userData);
          
          // Store the user's full name (givenName + surname), with fallback
          const givenName = userData.givenName || 'User';
          const surname = userData.surname || '';
          // In LoginScreen.js, ensure userName is stored correctly
          const userName = `${userData.givenName || ''} ${userData.surname || ''}`.trim() || 'User';
          await AsyncStorage.setItem('userName', userName);
          await AsyncStorage.setItem('accessToken', result.accessToken);
          if (navigation) {
            navigation.replace('MainTab'); // Updated to navigate to MainTab (stack screen name)
          } else {
            console.error('Navigation is not available during login');
            setErrorMessage('Navigation error occurred. Please try again.');
            setLoading(false);
          }
        } catch (error) {
          console.error('Token Exchange Error:', error);
          setErrorMessage(error.message || 'Failed to exchange token. Please try again.');
          setLoading(false);
        }
      };
      getToken();
    }
  }, [response, navigation]); // Add navigation as a dependency

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        <View style={styles.container}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      <View style={styles.container}>
      
        <View style={[styles.backgroundCircle1, { width: width * 0.8, height: width * 0.8 }]} />
        <View style={[styles.backgroundCircle2, { width: width * 0.6, height: width * 0.6 }]} />
        <View style={[styles.backgroundCircle3, { width: width * 0.5, height: width * 0.5 }]} />

       
        <Text style={styles.welcomeText}>Your Companion eSathi!</Text>

        {request ? (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={async () => {
              try {
                if (!request) {
                  console.log('Authentication request is not ready');
                  setErrorMessage('Login is not ready. Please try again.');
                  return;
                }
                console.log('Starting Microsoft login with request:', request);
                const result = await promptAsync();
                console.log('Prompt Result:', result);
              } catch (error) {
                console.error('Button Press Error:', error);
                setErrorMessage('Failed to initiate login. Please try again.');
              }
            }}
            disabled={!request}
          >
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/732/732221.png' }}
              style={styles.microsoftLogo}
            />
            <Text style={styles.signInButtonText}>Sign in with Microsoft</Text>
          </TouchableOpacity>
        ) : null}

        {loading ? <Text style={styles.loading}>Loading...</Text> : null}
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C3E50',
  },
  backgroundCircle1: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    top: -width * 0.1,
    left: -width * 0.1,
  },
  backgroundCircle2: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(41, 128, 185, 0.15)',
    top: height * 0.2,
    right: -width * 0.1,
  },
  backgroundCircle3: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(30, 104, 160, 0.1)',
    bottom: height * 0.1,
    left: -width * 0.05,
  },
  welcomeText: {
    fontSize: width * 0.07,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: height * 0.03,
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  microsoftLogo: {
    width: width * 0.05,
    height: width * 0.05,
    marginRight: width * 0.015,
  },
  signInButtonText: {
    fontSize: width * 0.04,
    color: '#0078D4',
    fontWeight: '500',
    fontFamily: 'sans-serif',
  },
  loading: {
    marginTop: height * 0.02,
    color: '#FF8C00',
    fontSize: width * 0.04,
  },
  errorMessage: {
    marginTop: height * 0.03,
    color: '#FF0000',
    fontWeight: '500',
    fontSize: width * 0.04,
  },
});