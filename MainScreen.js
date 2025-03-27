import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, SafeAreaView, StatusBar, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function MainScreen({ internetStatus }) { // Receive internetStatus as a prop
  const [userName, setUserName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        console.log('Loaded userName from AsyncStorage:', storedName || 'null/undefined');
        setUserName(storedName ? storedName.trim() : 'User');
      } catch (error) {
        console.error('Error loading user name:', error);
        setUserName('User');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserName();
  }, []);

  useEffect(() => {
    console.log('Rendering MainScreen with userName:', userName ? userName : 'null/undefined');
  }, [userName]);

  const actions = [
    { id: '1', title: 'Action 1', icon: require('./assets/images/set_location_attendance.png') },
    { id: '2', title: 'Action 2', icon: require('./assets/images/set_location_attendance.png') },
    { id: '3', title: 'Action 3', icon: require('./assets/images/set_location_attendance.png') },
    { id: '4', title: 'Action 4', icon: require('./assets/images/set_location_attendance.png') },
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
              source={require('./assets/images/image_checkincheckout_home.png')}
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
              <Text style={styles.internetStatus}>{internetStatus}</Text>
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
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0f1c3e',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: height * 0.01,
    textAlign: 'center',
    fontFamily: 'sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  illustration: {
    width: width * 0.9,
    height: width * 0.5,
    resizeMode: 'contain',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    borderRadius: 10,
    width: width * 0.9,
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginTop: height * 0.01,
  },
  InternetinfoContainer: {
    backgroundColor: 'transparent',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    borderRadius: 10,
    width: width * 0.9,
    alignSelf: 'center',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    marginTop: height * 0.01,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  InternetinfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: width * 0.04,
    color: '#2C3E50',
    fontWeight: '700',
    flex: 1,
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  internetStatus: {
    fontSize: width * 0.04,
    color: '#2C3E50',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  workTimeText: {
    fontSize: width * 0.04,
    color: 'orange',
    flex: 1,
    textAlign: 'right',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    width: width * 0.4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: width * 0.15,
    height: width * 0.15,
    marginBottom: height * 0.01,
  },
  actionText: {
    fontSize: width * 0.04,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loading: {
    fontSize: width * 0.04,
    color: '#FF8C00',
    textAlign: 'center',
  },
});