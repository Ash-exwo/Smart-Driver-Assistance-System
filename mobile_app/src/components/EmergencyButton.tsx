import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CarState } from '../types';

interface EmergencyButtonProps {
  carState: CarState;
  onEmergencyStop: () => void;
  onResetPower: () => void;
  hapticsEnabled: boolean;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  carState,
  onEmergencyStop,
  onResetPower,
  hapticsEnabled,
}) => {
  const isHalted = carState === 'HALTED';

  const handlePress = () => {
    if (hapticsEnabled && Platform.OS !== 'web') {
      try {
        if (isHalted) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch {}
    }

    if (isHalted) {
      onResetPower();
    } else {
      onEmergencyStop();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isHalted ? styles.rearmButton : styles.stopButton]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{isHalted ? '⚡' : '🛑'}</Text>
        <View style={styles.textWrap}>
          <Text style={styles.mainTitle}>
            {isHalted ? 'RESTORE POWER & ARM MOTORS' : 'EMERGENCY TYRE DISCONNECT'}
          </Text>
          <Text style={styles.subtitle}>
            {isHalted
              ? 'Clear microsleep lock & re-enable BTS7960 gates'
              : 'Immediately float MOSFET gates (Hard Cutoff)'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#090d16',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    elevation: 8,
  },
  stopButton: {
    backgroundColor: '#b91c1c',
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  rearmButton: {
    backgroundColor: '#047857',
    borderWidth: 2,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textWrap: {
    alignItems: 'flex-start',
  },
  mainTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
});
