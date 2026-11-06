import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CarState } from '../types';

interface StatusBannerProps {
  state: CarState;
  onRearm: () => void;
  autoBraked?: boolean;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  state,
  onRearm,
  autoBraked,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'HALTED' || autoBraked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, autoBraked]);

  if (state === 'HALTED') {
    return (
      <Animated.View style={[styles.container, styles.haltedContainer, { opacity: pulseAnim }]}>
        <View style={styles.haltedContent}>
          <Text style={styles.haltedIcon}>⚠️</Text>
          <View style={styles.haltedTextWrap}>
            <Text style={styles.haltedTitle}>MICROSLEEP DETECTED</Text>
            <Text style={styles.haltedSubtitle}>Tyres disconnected & MOSFET gates floated</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.rearmButton} onPress={onRearm} activeOpacity={0.8}>
          <Text style={styles.rearmButtonText}>RESTORE POWER</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (autoBraked) {
    return (
      <View style={[styles.container, styles.warnContainer]}>
        <Text style={styles.warnText}>🛑 OBSTACLE BRAKE: Proximity limit reached</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        state === 'MANUAL' ? styles.manualContainer : styles.idleContainer,
      ]}
    >
      <Text
        style={[
          styles.statusText,
          state === 'MANUAL' ? styles.manualText : styles.idleText,
        ]}
      >
        {state === 'MANUAL' ? '⚡ MANUAL CONTROL ENGAGED' : '🛡️ SYSTEM ARMED & READY'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  idleText: {
    color: '#34d399',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  manualContainer: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  manualText: {
    color: '#00f0ff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  warnContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warnText: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 13,
  },
  haltedContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    paddingVertical: 14,
  },
  haltedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  haltedIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  haltedTextWrap: {
    flex: 1,
  },
  haltedTitle: {
    color: '#f87171',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  haltedSubtitle: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 2,
  },
  rearmButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  rearmButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  statusText: {
    textAlign: 'center',
  },
});
