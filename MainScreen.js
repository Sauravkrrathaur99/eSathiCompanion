import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, SafeAreaView, StatusBar, ScrollView, Image } from 'react-native'; // Ensure Image and Text are imported
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the timer icon

const { width, height } = Dimensions.get('window');

export default function MainScreen() {
  const [userName, setUserName] = useState(null); // Initialize as null to track undefined/empty states
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        console.log('Loaded userName from AsyncStorage:', storedName || 'null/undefined'); // Debug log with fallback
        setUserName(storedName ? storedName.trim() : 'User'); // Trim and use default 'User' if empty or null
      } catch (error) {
        console.error('Error loading user name:', error);
        setUserName('User'); // Fallback, wrapped in Text if rendered
      } finally {
        setIsLoading(false); // Set loading to false when done
      }
    };
    loadUserName();
  }, []);

  useEffect(() => {
    console.log('Rendering MainScreen with userName:', userName ? userName : 'null/undefined'); // Debug log for rendering
  }, [userName]); // Log whenever userName changes

  const actions = [
    { id: '1', title: 'Action 1', icon: require('./assets/images/set_location_attendance.png') }, // Updated path
    { id: '2', title: 'Action 2', icon: require('./assets/images/set_location_attendance.png') }, // Update with your actual icon
    { id: '3', title: 'Action 3', icon: require('./assets/images/set_location_attendance.png') }, // Update with your actual icon
    { id: '4', title: 'Action 4', icon: require('./assets/images/set_location_attendance.png') }, // Update with your actual icon
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.container}>
            <Text style={styles.loading}>Loading...</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              {userName && userName.trim() ? `Welcome, ${userName.trim()}` : 'Welcome, User'}
            </Text>
            <Image
              source={require('./assets/images/image_checkincheckout_home.png')} // Updated path
              style={styles.illustration}
            />
          </View>

          
          <View style={[styles.infoContainer, { marginTop: -height * 0.02 }]}> 
            <View style={styles.infoRow}>
              <Text style={styles.dateText}>Mon, Dec 16, 2024</Text>
              <View style={styles.timerIconContainer}>
                <Ionicons name="time" size={width * 0.06} color="#2C3E50" /> 
              </View>
              <Text style={styles.workTimeText}>00:49:51</Text>
            </View>
          </View>

         
          <View style={[styles.InternetinfoContainer, { marginTop: height * 0.001 }]}> 
            <View style={styles.InternetinfoRow}>
              <Text style={styles.internetStatus}>Connected via WiFi</Text>
            </View>
          </View>

         
          <View style={styles.actionsContainer}>
            {actions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.actionButton}>
                <Image source={action.icon} style={styles.actionIcon} />
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light background for a modern look
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1, // Ensures content can expand and scroll
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0f1c3e', // Dark blue-gray for a professional header
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: width * 0.04, // Professional, modern font size
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: height * 0.01,
    textAlign: 'center',
    fontFamily: 'sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle black shadow for modern look
    textShadowOffset: { width: 1, height: 1 }, // Small offset for shadow
    textShadowRadius: 2, // Soft shadow blur
  },
  illustration: {
    width: width * 0.9, // Responsive illustration size
    height: width * 0.5,
    resizeMode: 'contain',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: height * 0.01, // Adjusted for tighter vertical spacing
    paddingHorizontal: width * 0.04,
    borderRadius: 10, // Capsule shape with larger radius for cylindrical look
    width: width * 0.9, // Narrower width (90% of screen width, adjustable)
    alignSelf: 'center', // Center the capsule horizontally
    elevation: 4, // Subtle shadow for modern look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginTop: height * 0.01, // Default margin, overridden in render for overlap
  },
  InternetinfoContainer: {
    backgroundColor: 'transparent', // Set to transparent to show only the text
    paddingVertical: height * 0.01, // Adjusted for tighter vertical spacing
    paddingHorizontal: width * 0.04,
    borderRadius: 10, // Maintain capsule shape for consistency
    width: width * 0.9, // Narrower width (90% of screen width, adjustable)
    alignSelf: 'center', // Center the capsule horizontally
    elevation: 0, // Remove shadow for transparency
    shadowColor: 'transparent', // Remove shadow for transparency
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    marginTop: height * 0.01, // Default margin, overridden in render for overlap
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distributes items across the row (left, center, right)
  },
  InternetinfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the text horizontally
  },
  dateText: {
    fontSize: width * 0.04,
    color: '#2C3E50',
    fontWeight: '700',
    flex: 1, // Allows text to take available space on the left
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle black shadow for modern look
    textShadowOffset: { width: 1, height: 1 }, // Small offset for shadow
    textShadowRadius: 2, // Soft shadow blur
  },
  internetStatus: {
    fontSize: width * 0.04,
    color: '#2C3E50',
    fontWeight: '700',
    textAlign: 'center', // Center the text within the Text component
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Subtle black shadow for modern look
    textShadowOffset: { width: 1, height: 1 }, // Small offset for shadow
    textShadowRadius: 2, // Soft shadow blur
  },
  timerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0, // Prevents the icon from stretching
  },
  workTimeText: {
    fontSize: width * 0.04,
    color: 'orange',
    flex: 1, // Allows text to take available space on the right
    textAlign: 'right',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle black shadow for modern look
    textShadowOffset: { width: 1, height: 1 }, // Small offset for shadow
    textShadowRadius: 2, // Soft shadow blur
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.03,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    padding: width * 0.03,
    marginBottom: height * 0.02,
    width: width * 0.4, // Responsive width for two columns
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: width * 0.15, // Responsive icon size
    height: width * 0.15,
    marginBottom: height * 0.01,
  },
  actionText: {
    fontSize: width * 0.04,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle black shadow for modern look
    textShadowOffset: { width: 1, height: 1 }, // Small offset for shadow
    textShadowRadius: 2, // Soft shadow blur
  },
  loading: {
    fontSize: width * 0.04,
    color: '#FF8C00',
    textAlign: 'center',
  },
});