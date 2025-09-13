import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState('');
  const [lastHandDetection, setLastHandDetection] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState(null);
  const cameraRef = useRef(null);

  // Request audio permissions
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setAudioPermission(status === 'granted');
        // Set audio mode for playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Audio permission error:', error);
        setAudioPermission(false);
      }
    })();
  }, []);

  const playBellSound = async () => {
    if (!audioPermission) {
      console.log('Audio permission not granted');
      return;
    }
    
    let sound;
    try {
      // Using a simple beep sound instead of requiring an external file
      // You can replace this with your bell.mp3 file path if you have it
      const soundObj = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: false }
      );
      sound = soundObj.sound;
      await sound.playAsync();
      
      // Clean up after sound finishes
      setTimeout(async () => {
        if (sound) {
          try {
            await sound.unloadAsync();
          } catch (e) {
            console.log('Sound cleanup error:', e);
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('Bell sound error:', error);
      // Fallback: just vibrate if available
      // Vibration.vibrate(500);
    }
  };

  // Simple hand detection simulation - in a real app you'd use ML Kit or TensorFlow
  const detectHand = async () => {
    const now = Date.now();
    if (now - lastHandDetection < 3000) return false; // 3-second cooldown

    try {
      // Simulate hand detection - replace with actual computer vision
      // For now, this triggers randomly for testing
      const isHandDetected = Math.random() > 0.92; // ~8% probability for testing
      
      if (isHandDetected) {
        setTriggerMessage('Hand Detected! 🖐️');
        setLastHandDetection(now);
        await playBellSound();
        
        // Clear message after 3 seconds
        setTimeout(() => setTriggerMessage(''), 3000);
        return true;
      }
    } catch (error) {
      console.error('Hand detection error:', error);
    }
    return false;
  };

  // Monitor hand when isMonitoring is true
  useEffect(() => {
    let interval = null;
    if (isMonitoring && permission?.granted) {
      interval = setInterval(async () => {
        await detectHand();
      }, 500); // Check every 500ms
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, permission?.granted]);

  // Handle permission request
  const handlePermissionRequest = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to detect hand gestures.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Auto-request permission when component mounts
  useEffect(() => {
    if (permission?.canAskAgain && !permission?.granted) {
      handlePermissionRequest();
    }
  }, [permission]);

  const renderCameraView = () => {
    if (!permission) {
      return <Text style={styles.testText}>Loading camera...</Text>;
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.testText}>Camera permission required</Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={handlePermissionRequest}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <CameraView
        style={styles.cameraPreview}
        facing="front"
        ref={cameraRef}
        onCameraReady={() => console.log('Camera is ready')}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hand Detection Test</Text>
      
      <Text style={styles.statusText}>
        {isMonitoring ? '👁️ Monitoring for hands...' : '⏸️ Press Start to begin monitoring'}
      </Text>

      {triggerMessage ? (
        <Text style={styles.triggerText}>{triggerMessage}</Text>
      ) : null}

      <View style={styles.cameraContainer}>
        {renderCameraView()}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          !permission?.granted && styles.buttonDisabled
        ]}
        onPress={() => {
          if (permission?.granted) {
            setIsMonitoring(!isMonitoring);
            if (isMonitoring) {
              setTriggerMessage('');
            }
          } else {
            handlePermissionRequest();
          }
        }}
      >
        <Text style={styles.buttonText}>
          {!permission?.granted ? 'Enable Camera' : isMonitoring ? 'Stop' : 'Start'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        {permission?.granted 
          ? 'Show your open palm to the front camera' 
          : 'Camera access needed for hand detection'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  triggerText: {
    color: '#00FF00',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  cameraContainer: {
    marginVertical: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraPreview: {
    width: 250,
    height: 250,
  },
  permissionContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    width: 200,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});