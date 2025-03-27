import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Dimensions, View, Text, AppState } from 'react-native';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import HistoryScreen from './HistoryScreen';
import UserScreen from './UserScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { checkLocationStatus, isLocationEnabled, requestLocationPermission, requestEnableLocation, checkLocationPermission } from './locationManager';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo for internet connectivity

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const { width, height } = Dimensions.get('window');

const MainTabNavigator = ({ internetStatus }) => (
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
    <Tab.Screen
      name="Home"
      children={() => <MainScreen internetStatus={internetStatus} />}
    />
    <Tab.Screen name="User" component={UserScreen} />
  </Tab.Navigator>
);

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [locationReady, setLocationReady] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const lastPromptTime = useRef(0);
  const [internetStatus, setInternetStatus] = useState('Checking...'); // Track internet status

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState changed:', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Check location status on app start
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Starting initializeApp...');
      try {
        let hasPermission = false;
        let locationEnabled = false;

        while (!hasPermission || !locationEnabled) {
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

        console.log('Location and permission ready, proceeding...');
        if (__DEV__) {
          console.clearErrors && console.clearErrors();
        }
        setLocationReady(true);
        setLocationEnabled(true);
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

  // Monitor location and internet connectivity in real-time
  useEffect(() => {
    let subscription;
    let pollingInterval;
    let currentPollingInterval = 3000;
    let netInfoUnsubscribe;

    const monitorLocationAndInternet = async () => {
      console.log('Starting location and internet monitoring...');
      try {
        // Monitor location
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Low, timeInterval: 5000 },
          async () => {
            console.log('Location update received from watchPositionAsync...');
          }
        );

        // Monitor internet connectivity
        netInfoUnsubscribe = NetInfo.addEventListener(state => {
          console.log('Network state changed:', state);
          if (state.isConnected) {
            if (state.type === 'wifi') {
              setInternetStatus('Connected via WiFi');
            } else if (state.type === 'cellular') {
              setInternetStatus('Connected via Mobile Data');
            } else {
              setInternetStatus('Connected (Unknown Network)');
            }
          } else {
            setInternetStatus('No Internet Connection');
          }
        });

        // Initial internet status check
        const initialState = await NetInfo.fetch();
        if (initialState.isConnected) {
          if (initialState.type === 'wifi') {
            setInternetStatus('Connected via WiFi');
          } else if (initialState.type === 'cellular') {
            setInternetStatus('Connected via Mobile Data');
          } else {
            setInternetStatus('Connected (Unknown Network)');
          }
        } else {
          setInternetStatus('No Internet Connection');
        }

        // Use polling to check location services status
        const pollLocationStatus = async () => {
          if (appState.current !== 'active') {
            console.log('App is in background, skipping location check...');
            return;
          }

          console.log('Polling location status...');
          const isEnabled = await isLocationEnabled();
          const hasPermission = await checkLocationPermission();
          console.log('Poll - Permission:', hasPermission, 'Location Enabled:', isEnabled);

          if (hasPermission && isEnabled) {
            if (!locationEnabled) {
              console.log('Poll - Location re-enabled, updating state...');
              setIsRedirecting(true);
              setTimeout(() => {
                setIsRedirecting(false);
                setLocationEnabled(true);
                if (__DEV__) {
                  console.clearErrors && console.clearErrors();
                }
              }, 2000);
            }
            if (currentPollingInterval !== 3000) {
              console.log('Location enabled, switching to 3-second polling interval...');
              clearInterval(pollingInterval);
              currentPollingInterval = 3000;
              pollingInterval = setInterval(pollLocationStatus, currentPollingInterval);
            }
          } else {
            if (!hasPermission) {
              console.log('Poll - Permission revoked, requesting again...');
              const granted = await requestLocationPermission();
              if (!granted) {
                console.log('Poll - Permission denied, keeping locationReady true to continue monitoring...');
                return;
              }
            }

            if (!isEnabled) {
              console.log('Poll - Location disabled, switching to 1-second polling interval...');
              if (currentPollingInterval !== 1000) {
                clearInterval(pollingInterval);
                currentPollingInterval = 1000;
                pollingInterval = setInterval(pollLocationStatus, currentPollingInterval);
              }

              setLocationEnabled(false);

              const now = Date.now();
              if (now - lastPromptTime.current < 5000) {
                console.log('Poll - Skipping prompt, waiting for grace period...');
                return;
              }

              try {
                console.log('Poll - Requesting to enable location...');
                lastPromptTime.current = now;
                const locationEnabledResult = await requestEnableLocation();
                console.log('Poll - Location enabled after request:', locationEnabledResult);
                if (!locationEnabledResult) {
                  console.log('Poll - Location still not enabled, will retry on next poll...');
                } else {
                  setIsRedirecting(true);
                  setTimeout(() => {
                    setIsRedirecting(false);
                    setLocationEnabled(true);
                    if (__DEV__) {
                      console.clearErrors && console.clearErrors();
                    }
                  }, 2000);
                }
              } catch (error) {
                console.log('Poll - Failed to enable location, retrying on next cycle...');
              }
            }
          }
        };

        pollingInterval = setInterval(pollLocationStatus, currentPollingInterval);
      } catch (error) {
        console.log('Monitor - Failed to start location monitoring, retrying on next cycle...');
      }
    };

    if (appStateVisible === 'active') {
      monitorLocationAndInternet();
    } else {
      console.log('Skipping location and internet monitoring: AppState:', appStateVisible);
    }

    return () => {
      if (subscription) {
        console.log('Cleaning up location subscription...');
        subscription.remove();
      }
      if (pollingInterval) {
        console.log('Cleaning up polling interval...');
        clearInterval(pollingInterval);
      }
      if (netInfoUnsubscribe) {
        console.log('Cleaning up NetInfo subscription...');
        netInfoUnsubscribe();
      }
    };
  }, [appStateVisible]);

  const LocationDisabledScreen = () => (
    <View style={styles.locationDisabledContainer}>
      {isRedirecting ? (
        <>
          <Text style={styles.redirectingText}>Redirecting to your Home</Text>
          <Animatable.View
            animation={{
              0: { opacity: 0, scale: 0.5 },
              0.5: { opacity: 1, scale: 1.2 },
              1: { opacity: 1, scale: 1 },
            }}
            iterationCount="infinite"
            duration={1500}
            style={styles.animatedIconContainer}
          >
            <Ionicons name="home" size={width * 0.1} color="#FF8C00" />
          </Animatable.View>
        </>
      ) : (
        <>
          <MaterialIcons name="location-off" size={width * 0.15} color="#FF4444" style={styles.warningIcon} />
          <Text style={styles.locationDisabledText}>
            Please enable location services to continue using the app.
          </Text>
        </>
      )}
    </View>
  );

  if (!locationReady || initialRoute === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking location...</Text>
      </View>
    );
  }

  if (!locationEnabled) {
    return <LocationDisabledScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="MainTab"
          children={() => <MainTabNavigator internetStatus={internetStatus} />}
          options={{ headerShown: false }}
        />
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
  locationDisabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  locationDisabledText: {
    fontSize: width * 0.05,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  warningIcon: {
    marginBottom: 10,
  },
  redirectingText: {
    fontSize: width * 0.05,
    color: '#FF8C00',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  animatedIconContainer: {
    marginTop: 10,
  },
});

export default App;