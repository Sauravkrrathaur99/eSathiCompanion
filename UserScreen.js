import React from 'react';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, StatusBar, ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function UserScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>User Profile</Text>
          <Text style={styles.subtitle}>Manage your profile and settings here.</Text>
         
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
    flexGrow: 1, // Ensures content can expand and scroll
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: height * 0.01,
    fontFamily: 'sans-serif',
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
});