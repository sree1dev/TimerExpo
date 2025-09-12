import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Audio } from 'expo-av';

export default function App() {
  const [isClapTriggerEnabled, setClapTriggerEnabled] = useState(false);
  const [isHandTriggerEnabled, setHandTriggerEnabled] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [timer, setTimer] = useState(0);

  const playBellSound = async (times: number = 1) => {
    try {
      for (let i = 0; i < times; i++) {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/bell.mp3')
        );
        await sound.playAsync();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second gap between bells
        await sound.unloadAsync(); // Unload after each play
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play bell sound. Check if bell.mp3 exists in assets.');
      console.error(error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStarted) {
      // 7-second delay for start bell
      setTimeout(() => {
        playBellSound(1); // Single bell after 7 seconds
      }, 7000);

      // Start 2-minute timer
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= 25) { // 2 minutes = 120 seconds
            playBellSound(2); // Double bell at end
            setIsStarted(false); // Reset to "Start"
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStarted]);

  return (
    <View style={styles.container}>
      <Text style={styles.testText}>
        {isStarted ? `Time: ${timer}s` : 'Testing UI'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setIsStarted(!isStarted);
          if (isStarted) {
            setTimer(0); // Reset timer on Restart
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
  testText: {
    color: '#FFFFFF', // White text
    fontSize: 20,
    marginBottom: 20,
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