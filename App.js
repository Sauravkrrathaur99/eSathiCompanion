import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Dimensions, View } from 'react-native'; // Import Dimensions
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import HistoryScreen from './HistoryScreen';
import UserScreen from './UserScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const { width, height } = Dimensions.get('window'); // Define width and height

const MainTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home" // Home is the default tab
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
      tabBarActiveTintColor: '#2C3E50', // Dark blue-gray for active tab
      tabBarInactiveTintColor: '#666',
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
      tabBarLabelPosition: 'below-icon', // Ensures labels are below icons
      headerShown: false, // Hide header for full-screen tabs
    })}
  >
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Home" component={MainScreen} />
    <Tab.Screen name="User" component={UserScreen} />
  </Tab.Navigator>
);

const App = () => {
  const [initialRoute, setInitialRoute] = useState('Loading');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('accessToken');
        if (storedToken) {
          setInitialRoute('MainTab'); // Navigate to tab navigation if token exists
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error checking token in App.js:', error);
        setInitialRoute('Login');
      }
    };
    checkToken();
  }, []);

  if (initialRoute === 'Loading') {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} // Hide header for full-screen login
        />
        <Stack.Screen
          name="MainTab"
          component={MainTabNavigator}
          options={{ headerShown: false }} // Hide header for tab navigation
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
    height: 60, // Fixed height for a modern, consistent look
    paddingBottom: 5, // Small padding for better spacing
  },
  tabLabel: {
    fontSize: width * 0.03, // Smaller, modern font size for labels
    fontWeight: '500',
    fontFamily: 'sans-serif',
    marginBottom: 5, // Ensure labels are properly spaced below icons
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;