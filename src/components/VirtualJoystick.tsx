import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';
import { CarState } from '../types';

interface VirtualJoystickProps {
  onDriveChange: (leftPwm: number, rightPwm: number) => void;
  maxSpeed: number;
  carState: CarState;
}

const JOYSTICK_RADIUS = 90;
const KNOB_RADIUS = 35;
const MAX_DEFLECTION = JOYSTICK_RADIUS - KNOB_RADIUS;

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onDriveChange,
  maxSpeed,
  carState,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [activeCoords, setActiveCoords] = useState({ x: 0, y: 0 });
  const [motorLevels, setMotorLevels] = useState({ left: 0, right: 0 });

  const calculateMotorSpeeds = (dx: number, dy: number) => {
    // Normalize -1 to 1
    const normX = dx / MAX_DEFLECTION;
    // dy is positive downwards, so invert for forward throttle
    const normY = -dy / MAX_DEFLECTION;

    // Differential steering algorithm
    const throttle = normY * maxSpeed;
    const steer = normX * (maxSpeed * 0.85);

    let left = throttle + steer;
    let right = throttle - steer;

    // Constrain to -maxSpeed .. maxSpeed
    left = Math.round(Math.max(-maxSpeed, Math.min(maxSpeed, left)));
    right = Math.round(Math.max(-maxSpeed, Math.min(maxSpeed, right)));

    return { left, right };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => carState !== 'HALTED',
      onMoveShouldSetPanResponder: () => carState !== 'HALTED',

      onPanResponderGrant: () => {
        pan.setOffset({ x: 0, y: 0 });
      },

      onPanResponderMove: (_, gestureState) => {
        if (carState === 'HALTED') return;

        let { dx, dy } = gestureState;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > MAX_DEFLECTION) {
          const angle = Math.atan2(dy, dx);
          dx = Math.cos(angle) * MAX_DEFLECTION;
          dy = Math.sin(angle) * MAX_DEFLECTION;
        }

        pan.setValue({ x: dx, y: dy });
        setActiveCoords({ x: Math.round(dx), y: Math.round(dy) });

        const { left, right } = calculateMotorSpeeds(dx, dy);
        setMotorLevels({ left, right });
        onDriveChange(left, right);
      },

      onPanResponderRelease: () => {
        // Spring back to center
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          tension: 80,
          useNativeDriver: false,
        }).start();

        setActiveCoords({ x: 0, y: 0 });
        setMotorLevels({ left: 0, right: 0 });
        onDriveChange(0, 0);
      },
    })
  ).current;

  const isLocked = carState === 'HALTED';

  return (
    <View style={styles.container}>
      {/* Live Differential Output Telemetry */}
      <View style={styles.telemetryBar}>
        <View style={styles.motorBadge}>
          <Text style={styles.motorLabel}>LEFT MOTOR</Text>
          <Text style={[styles.motorVal, motorLevels.left < 0 && styles.revVal]}>
            {motorLevels.left > 0 ? `+${motorLevels.left}` : motorLevels.left}
          </Text>
        </View>

        <View style={styles.centerDivider} />

        <View style={styles.motorBadge}>
          <Text style={styles.motorLabel}>RIGHT MOTOR</Text>
          <Text style={[styles.motorVal, motorLevels.right < 0 && styles.revVal]}>
            {motorLevels.right > 0 ? `+${motorLevels.right}` : motorLevels.right}
          </Text>
        </View>
      </View>

      {/* Joystick Base Pad */}
      <View
        style={[styles.joystickBase, isLocked && styles.lockedBase]}
        {...panResponder.panHandlers}
      >
        {/* Crosshair guidelines */}
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />
        <View style={styles.innerRing} />

        {/* Draggable Knob */}
        <Animated.View
          style={[
            styles.joystickKnob,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
            isLocked && styles.lockedKnob,
          ]}
        >
          <View style={styles.knobCenterDot} />
        </Animated.View>
      </View>

      <Text style={styles.hintText}>
        {isLocked ? 'JOYSTICK LOCKED: VEHICLE HALTED' : 'DRAG TO STEER & ACCELERATE'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  telemetryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: JOYSTICK_RADIUS * 2 + 40,
    backgroundColor: '#0d131f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  motorBadge: {
    alignItems: 'center',
    flex: 1,
  },
  centerDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1e293b',
  },
  motorLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  motorVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00f0ff',
    marginTop: 2,
  },
  revVal: {
    color: '#f59e0b',
  },
  joystickBase: {
    width: JOYSTICK_RADIUS * 2,
    height: JOYSTICK_RADIUS * 2,
    borderRadius: JOYSTICK_RADIUS,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#1f293d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  lockedBase: {
    opacity: 0.35,
    borderColor: '#7f1d1d',
  },
  crosshairH: {
    position: 'absolute',
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  crosshairV: {
    position: 'absolute',
    height: '80%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  innerRing: {
    position: 'absolute',
    width: JOYSTICK_RADIUS,
    height: JOYSTICK_RADIUS,
    borderRadius: JOYSTICK_RADIUS / 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
    borderStyle: 'dashed',
  },
  joystickKnob: {
    width: KNOB_RADIUS * 2,
    height: KNOB_RADIUS * 2,
    borderRadius: KNOB_RADIUS,
    backgroundColor: '#00f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  lockedKnob: {
    backgroundColor: '#475569',
    borderColor: '#334155',
    shadowOpacity: 0,
  },
  knobCenterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0b1329',
  },
  hintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginTop: 14,
  },
});
