import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { authorize } from 'react-native-app-auth';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Microsoft App Details
const clientId = '68a4e767-34b2-41e5-b4c7-59578dae21b8';
const tenantId = '1de61f46-fc12-4067-ab1d-147eb7e21025';
const redirectUri = 'msauth://com.yourcompany.esathicompanion/M61nf%2BaC69kCXmFY1ejcX83rDNc%3D';

const config = {
  issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  clientId,
  redirectUrl: redirectUri,
  scopes: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
  additionalParameters: {},
  serviceConfiguration: {
    authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  },
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true); // start with loading=true like old code
  const [errorMessage, setErrorMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // (1) Validate token and fetch user info (copied from old code)
  const validateToken = async (token) => {
    setLoading(true);
    try {
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userInfoResponse.ok) {
        const userData = await userInfoResponse.json();
        setUserInfo(userData);
        const userName = `${userData.givenName || ''} ${userData.surname || ''}`.trim() || 'User';
        await AsyncStorage.setItem('userName', userName);
        navigation.replace('MainTab');
      } else {
        // Token invalid or expired
        await AsyncStorage.removeItem('accessToken');
        setLoading(false);
      }
    } catch (error) {
      await AsyncStorage.removeItem('accessToken');
      setLoading(false);
      setErrorMessage('Failed to validate token. Please try again.');
    }
  };

  // (2) On mount, check for saved token, auto-login if present
  useEffect(() => {
    const checkExistingToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('accessToken');
        if (storedToken) {
          await validateToken(storedToken);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        setErrorMessage('Error loading token. Please try again.');
      }
    };
    checkExistingToken();
  }, []);

  // (3) Handle native login via react-native-app-auth
  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const authResult = await authorize(config);
      await AsyncStorage.setItem('accessToken', authResult.accessToken);
      if (authResult.refreshToken) {
        await AsyncStorage.setItem('refreshToken', authResult.refreshToken);
      }
      validateToken(authResult.accessToken);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'Failed to authorize');
    }
  };

  // UI/Styling, same as old code
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
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/732/732221.png' }}
            style={styles.microsoftLogo}
          />
          <Text style={styles.signInButtonText}>
            {loading ? 'Signing in...' : 'Sign in with Microsoft'}
          </Text>
        </TouchableOpacity>
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... same as your old code ...
  safeArea: { flex: 1, backgroundColor: '#2C3E50', },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C3E50', },
  backgroundCircle1: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(52, 152, 219, 0.2)', top: -width * 0.1, left: -width * 0.1, },
  backgroundCircle2: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(41, 128, 185, 0.15)', top: height * 0.2, right: -width * 0.1, },
  backgroundCircle3: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(30, 104, 160, 0.1)', bottom: height * 0.1, left: -width * 0.05, },
  welcomeText: { fontSize: width * 0.07, fontWeight: '600', color: '#FFFFFF', marginBottom: height * 0.03, textAlign: 'center', fontFamily: 'sans-serif', },
  signInButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: height * 0.015, paddingHorizontal: width * 0.04, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3, },
  microsoftLogo: { width: width * 0.05, height: width * 0.05, marginRight: width * 0.015, },
  signInButtonText: { fontSize: width * 0.04, color: '#0078D4', fontWeight: '500', fontFamily: 'sans-serif', },
  loading: { marginTop: height * 0.02, color: '#FF8C00', fontSize: width * 0.04, },
  errorMessage: { marginTop: height * 0.03, color: '#FF0000', fontWeight: '500', fontSize: width * 0.04, },
});
