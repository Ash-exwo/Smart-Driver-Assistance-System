import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GearMode } from '../types';

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const SpeedControl: React.FC<SpeedControlProps> = ({
  currentSpeed,
  onSpeedChange,
}) => {
  const getActiveGear = (): GearMode => {
    if (currentSpeed <= 140) return 'ECO';
    if (currentSpeed <= 210) return 'NORMAL';
    return 'SPORT';
  };

  const activeGear = getActiveGear();

  const handleGearSelect = (gear: GearMode) => {
    switch (gear) {
      case 'ECO':
        onSpeedChange(120);
        break;
      case 'NORMAL':
        onSpeedChange(185);
        break;
      case 'SPORT':
        onSpeedChange(250);
        break;
    }
  };

  const adjustSpeed = (delta: number) => {
    const next = Math.max(70, Math.min(255, currentSpeed + delta));
    onSpeedChange(next);
  };

  const percentage = Math.round((currentSpeed / 255) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>THROTTLE & SPEED LIMIT</Text>
          <Text style={styles.subtext}>{percentage}% POWER OUTPUT</Text>
        </View>

        <View style={styles.pwmDisplay}>
          <Text style={styles.pwmValue}>{currentSpeed}</Text>
          <Text style={styles.pwmUnit}>PWM</Text>
        </View>
      </View>

      {/* Visual Power Level Bar */}
      <View style={styles.powerBarTrack}>
        <View
          style={[
            styles.powerBarFill,
            {
              width: `${percentage}%`,
              backgroundColor:
                activeGear === 'SPORT'
                  ? '#ef4444'
                  : activeGear === 'NORMAL'
                  ? '#00f0ff'
                  : '#10b981',
            },
          ]}
        />
      </View>

      {/* Stepper & Gear Buttons */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => adjustSpeed(-15)}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>-15</Text>
        </TouchableOpacity>

        <View style={styles.gearGroup}>
          <TouchableOpacity
            style={[styles.gearBtn, activeGear === 'ECO' && styles.gearBtnEcoActive]}
            onPress={() => handleGearSelect('ECO')}
            activeOpacity={0.8}
          >
            <Text style={[styles.gearText, activeGear === 'ECO' && styles.gearTextActive]}>
              ECO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gearBtn, activeGear === 'NORMAL' && styles.gearBtnNormalActive]}
            onPress={() => handleGearSelect('NORMAL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.gearText, activeGear === 'NORMAL' && styles.gearTextActive]}>
              MID
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gearBtn, activeGear === 'SPORT' && styles.gearBtnSportActive]}
            onPress={() => handleGearSelect('SPORT')}
            activeOpacity={0.8}
          >
            <Text style={[styles.gearText, activeGear === 'SPORT' && styles.gearTextActive]}>
              SPORT
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => adjustSpeed(+15)}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>+15</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  subtext: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    marginTop: 2,
  },
  pwmDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pwmValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  pwmUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 3,
  },
  powerBarTrack: {
    height: 5,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  powerBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  gearGroup: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  gearBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  gearBtnEcoActive: {
    backgroundColor: '#10b981',
  },
  gearBtnNormalActive: {
    backgroundColor: '#00f0ff',
  },
  gearBtnSportActive: {
    backgroundColor: '#ef4444',
  },
  gearText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  gearTextActive: {
    color: '#000000',
  },
});
