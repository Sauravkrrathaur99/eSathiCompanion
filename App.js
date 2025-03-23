import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import HistoryScreen from './HistoryScreen';
import UserScreen from './UserScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { checkLocationStatus, isLocationEnabled, requestLocationPermission, requestEnableLocation, checkLocationPermission } from './locationManager';
import * as Location from 'expo-location';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const { width, height } = Dimensions.get('window');

const MainTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'time' : 'time-outline';
        } else if (route.name === 'User') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return (
          <View style={styles.iconContainer}>
            <Ionicons name={iconName} size={size * 0.8} color={color} />
          </View>
        );
      },
      tabBarActiveTintColor: '#2C3E50',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
      tabBarLabelPosition: 'below-icon',
      headerShown: false,
    })}
  >
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Home" component={MainScreen} />
    <Tab.Screen name="User" component={UserScreen} />
  </Tab.Navigator>
);

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [locationReady, setLocationReady] = useState(false);

  // Check location status on app start
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Starting initializeApp...');
      try {
        let hasPermission = false;
        let locationEnabled = false;

        // Keep asking for permission and location until both are granted
        while (!hasPermission || !locationEnabled) {
          // Step 1: Request location permission (Android system dialog)
          if (!hasPermission) {
            console.log('Checking initial permission status...');
            hasPermission = await checkLocationPermission();
            console.log('Initial permission status:', hasPermission);
            if (!hasPermission) {
              console.log('Requesting location permission...');
              hasPermission = await requestLocationPermission();
              console.log('Permission after request:', hasPermission);
              if (!hasPermission) {
                console.log('Permission denied, retrying in 1 second...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
            }
          }

          // Step 2: Check if location services are enabled
          if (!locationEnabled) {
            console.log('Checking if location services are enabled...');
            locationEnabled = await isLocationEnabled();
            console.log('Initial location enabled status:', locationEnabled);
            if (!locationEnabled) {
              console.log('Requesting to enable location...');
              locationEnabled = await requestEnableLocation();
              console.log('Location enabled after request:', locationEnabled);
              if (!locationEnabled) {
                console.log('Location still not enabled, retrying in 1 second...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
            }
          }
        }

        // If both permission and location are enabled, proceed
        console.log('Location and permission ready, proceeding...');
        // Clear any previous error overlays in development mode
        if (__DEV__) {
          console.clearErrors && console.clearErrors();
        }
        setLocationReady(true);
        try {
          const storedToken = await AsyncStorage.getItem('accessToken');
          console.log('Stored token:', storedToken);
          setInitialRoute(storedToken ? 'MainTab' : 'Login');
        } catch (error) {
          console.error('Error checking token in App.js:', error);
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error in initializeApp:', error);
      }
    };
    initializeApp();
  }, []);

  // Monitor location status in real-time, but only after location is ready
  useEffect(() => {
    let subscription;

    const monitorLocation = async () => {
      console.log('Starting location monitoring...');
      try {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Low, timeInterval: 5000 },
          async () => {
            console.log('Checking location status in monitor...');
            const isEnabled = await isLocationEnabled();
            const hasPermission = await checkLocationPermission();
            console.log('Monitor - Permission:', hasPermission, 'Location Enabled:', isEnabled);

            if (hasPermission && isEnabled) {
              if (!locationReady) {
                console.log('Monitor - Location and permission ready, proceeding...');
                setLocationReady(true);
                try {
                  const storedToken = await AsyncStorage.getItem('accessToken');
                  console.log('Monitor - Stored token:', storedToken);
                  setInitialRoute(storedToken ? 'MainTab' : 'Login');
                } catch (error) {
                  console.error('Monitor - Error checking token in App.js:', error);
                  setInitialRoute('Login');
                }
              }
            } else {
              if (!hasPermission) {
                console.log('Monitor - Permission revoked, requesting again...');
                const granted = await requestLocationPermission();
                if (!granted) {
                  console.log('Monitor - Permission denied, setting locationReady to false...');
                  setLocationReady(false);
                  return;
                }
              }

              if (!isEnabled) {
                console.log('Monitor - Location disabled, requesting to enable...');
                try {
                  const locationEnabled = await requestEnableLocation();
                  console.log('Monitor - Location enabled after request:', locationEnabled);
                  if (!locationEnabled) {
                    console.log('Monitor - Location still not enabled, setting locationReady to false...');
                    setLocationReady(false);
                  } else {
                    // Clear any previous error overlays in development mode
                    if (__DEV__) {
                      console.clearErrors && console.clearErrors();
                    }
                  }
                } catch (error) {
                  console.log('Monitor - Failed to enable location, retrying on next cycle...');
                  setLocationReady(false);
                }
              }
            }
          }
        );
      } catch (error) {
        console.log('Monitor - Failed to start location monitoring, retrying on next cycle...');
      }
    };

    // Only start monitoring if location is ready
    if (locationReady) {
      monitorLocation();
    } else {
      console.log('Skipping location monitoring until locationReady is true...');
    }

    return () => {
      if (subscription) {
        console.log('Cleaning up location subscription...');
        subscription.remove();
      }
    };
  }, [locationReady]);

  if (!locationReady || initialRoute === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking location...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTab" component={MainTabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 4,
    height: 60,
    paddingBottom: 5,
  },
  tabLabel: {
    fontSize: width * 0.03,
    fontWeight: '500',
    fontFamily: 'sans-serif',
    marginBottom: 5,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: width * 0.04,
    color: '#FF8C00',
  },
});

export default App;