import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const LocationPrompt = ({ onAllow, onDeny }) => {
  return (
    <View style={styles.container}>
      <View style={styles.promptBox}>
        <Text style={styles.title}>Allow Location Access</Text>
        <Text style={styles.message}>
          eSathiCompanion needs your location to provide accurate services. Please enable location access to continue.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onDeny}>
            <Text style={styles.buttonText}>Don't Allow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.allowButton]} onPress={onAllow}>
            <Text style={[styles.buttonText, styles.allowButtonText]}>Allow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptBox: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  message: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  allowButton: {
    backgroundColor: '#0078D4',
  },
  buttonText: {
    fontSize: width * 0.04,
    color: '#2C3E50',
    fontWeight: '500',
  },
  allowButtonText: {
    color: '#FFFFFF',
  },
});

export default LocationPrompt;