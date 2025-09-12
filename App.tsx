import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Audio } from 'expo-av';

export default function App() {
  const [isClapTriggerEnabled, setClapTriggerEnabled] = useState(false);
  const [isHandTriggerEnabled, setHandTriggerEnabled] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const playBellSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/bell.mp3') // Update to your file name
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync(); // Unload to free memory
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to play bell sound');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setIsStarted(!isStarted);
          if (!isStarted) {
            playBellSound(); // Play bell when starting
          }
        }}
      >
        <Text style={styles.buttonText}>{isStarted ? 'Restart' : 'Start'}</Text>
      </TouchableOpacity>
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={isClapTriggerEnabled}
          onValueChange={setClapTriggerEnabled}
          color={isClapTriggerEnabled ? '#8B4513' : undefined}
        />
        <Text style={styles.checkboxLabel}>Clap Trigger</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={isHandTriggerEnabled}
          onValueChange={setHandTriggerEnabled}
          color={isHandTriggerEnabled ? '#8B4513' : undefined}
        />
        <Text style={styles.checkboxLabel}>Hand Trigger</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Manual Trigger</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF', // White button
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#8B4513', // Brown text
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxLabel: {
    color: '#FFFFFF', // White text
    marginLeft: 10,
    fontSize: 16,
  },
});