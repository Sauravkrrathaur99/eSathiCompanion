import * as Location from 'expo-location';
import { Linking } from 'react-native';

// Check if location services are enabled
export const isLocationEnabled = async () => {
  try {
    const isEnabled = await Location.hasServicesEnabledAsync();
    console.log('isLocationEnabled:', isEnabled);
    return isEnabled;
  } catch (error) {
    console.error('Error in isLocationEnabled:', error);
    return false;
  }
};

// Check permission status without requesting
export const checkLocationPermission = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    console.log('checkLocationPermission:', status);
    return status === 'granted';
  } catch (error) {
    console.error('Error in checkLocationPermission:', error);
    return false;
  }
};

// Request location permission (triggers Android system dialog)
export const requestLocationPermission = async () => {
  try {
    console.log('Requesting location permission...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log('requestLocationPermission:', status);
    return status === 'granted';
  } catch (error) {
    console.error('Error in requestLocationPermission:', error);
    return false;
  }
};

// Trigger system dialog to enable location services
export const requestEnableLocation = async () => {
  try {
    console.log('Starting requestEnableLocation...');
    // Check if location is already enabled to avoid unnecessary dialog
    let isEnabled = await isLocationEnabled();
    if (isEnabled) {
      console.log('Location already enabled, skipping dialog.');
      return true;
    }

    // Use enableNetworkProviderAsync to prompt the user to enable location services
    console.log('Triggering enableNetworkProviderAsync to enable location...');
    try {
      await Location.enableNetworkProviderAsync();
    } catch (error) {
      console.log('enableNetworkProviderAsync failed, user may have declined:', error.message);
      return false;
    }

    // Retry checking location status up to 5 times with a delay
    let retries = 5;
    let locationEnabled = false;
    for (let i = 0; i < retries; i++) {
      console.log(`Retry ${i + 1}: Checking if location is enabled...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      locationEnabled = await isLocationEnabled();
      if (locationEnabled) {
        console.log('Location enabled after retry:', locationEnabled);
        break;
      }
    }

    console.log('Final location enabled status:', locationEnabled);
    return locationEnabled;
  } catch (error) {
    console.log('Error requesting to enable location:', error.message);
    return false;
  }
};

// Combined function to check location readiness
export const checkLocationStatus = async () => {
  try {
    const hasPermission = await checkLocationPermission();
    const locationEnabled = await isLocationEnabled();
    console.log('checkLocationStatus - Permission:', hasPermission, 'Location Enabled:', locationEnabled);
    return { hasPermission, locationEnabled };
  } catch (error) {
    console.error('Error in checkLocationStatus:', error);
    return { hasPermission: false, locationEnabled: false };
  }
};