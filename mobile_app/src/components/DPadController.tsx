import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DriveCommand, CarState } from '../types';

interface DPadControllerProps {
  onCommandStart: (cmd: DriveCommand) => void;
  onCommandEnd: () => void;
  carState: CarState;
  hapticsEnabled: boolean;
  commandRateMs: number;
}

export const DPadController: React.FC<DPadControllerProps> = ({
  onCommandStart,
  onCommandEnd,
  carState,
  hapticsEnabled,
  commandRateMs,
}) => {
  const [activeBtn, setActiveBtn] = useState<DriveCommand | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (hapticsEnabled && Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch { }
    }
  };

  const handlePressIn = (cmd: DriveCommand) => {
    if (carState === 'HALTED' && cmd !== 'S' && cmd !== 'STOP') {
      return;
    }

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setActiveBtn(cmd);
    onCommandStart(cmd);

    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
    }

    if (cmd !== 'S' && cmd !== 'STOP') {
      heartbeatTimer.current = setInterval(() => {
        onCommandStart(cmd);
      }, commandRateMs);
    }
  };

  const handlePressOut = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
    setActiveBtn(null);
    onCommandEnd();
  };

  const isLocked = carState === 'HALTED';

  return (
    <View style={styles.container}>
      {/* Row 1: Forward-Left, Forward, Forward-Right */}
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [
            styles.cornerBtn,
            (pressed || activeBtn === 'FL') && styles.btnActive,
            isLocked && styles.btnDisabled,
          ]}
          onPressIn={() => handlePressIn('FL')}
          onPressOut={handlePressOut}
          disabled={isLocked}
        >
          <Text style={styles.arrowText}>↖</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            (pressed || activeBtn === 'F') && styles.btnActive,
            isLocked && styles.btnDisabled,
          ]}
          onPressIn={() => handlePressIn('F')}
          onPressOut={handlePressOut}
          disabled={isLocked}
        >
          <Text style={styles.primaryArrowText}>▲</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.cornerBtn,
            (pressed || activeBtn === 'FR') && styles.btnActive,
            isLocked && styles.btnDisabled,
          ]}
          onPressIn={() => handlePressIn('FR')}
          onPressOut={handlePressOut}
          disabled={isLocked}
        >
          <Text style={styles.arrowText}>↗</Text>
        </Pressable>
      </View>

      {/* Row 2: Turn Left, Center Stop/Arm, Turn Right */}
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            (pressed || activeBtn === 'L') && styles.btnActive,
            isLocked && styles.btnDisabled,
          ]}
          onPressIn={() => handlePressIn('L')}
          onPressOut={handlePressOut}
          disabled={isLocked}
        >
          <Text style={styles.primaryArrowText}>◀</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.centerStopBtn,
            (pressed || activeBtn === 'S') && styles.centerStopBtnActive,
          ]}
          onPressIn={() => handlePressIn('S')}
          onPressOut={handlePressOut}
        >
          <Text style={styles.centerStopText}>{isLocked ? 'ARM' : 'BRAKE'}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            (pressed || activeBtn === 'R') && styles.btnActive,
            isLocked && styles.btnDisabled,
          ]}
          onPressIn={() => handlePressIn('R')}
          onPressOut={handlePressOut}
          disabled={isLocked}
        >
          <Text style={styles.primaryArrowText}>▶</Text>
        </Pressable>
      </View>

      {/* Row 3: Backward-Left, Backward, Backward-Right */}
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [
            styles.cornerBtn,
            (pressed || activeBtn === 'BL') && styles.btnActive,
            isLocked && styles.btnDisabled,
          ]}
          onPressIn={() => handlePressIn('BL')}
          onPressOut={handlePressOut}
          disabled={isLocked}
        >
          <Text style={styles.arrowText}>↙</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            (pressed || activeBtn === 'B') && styles.btnActive,
            isLocked && styles.btnDisabled,
          ]}
          onPressIn={() => handlePressIn('B')}
          onPressOut={handlePressOut}
          disabled={isLocked}
        >
          <Text style={styles.primaryArrowText}>▼</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.cornerBtn,
            (pressed || activeBtn === 'BR') && styles.btnActive,
            isLocked && styles.btnDisabled,
          ]}
          onPressIn={() => handlePressIn('BR')}
          onPressOut={handlePressOut}
          disabled={isLocked}
        >
          <Text style={styles.arrowText}>↘</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 6,
  },
  btn: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#162235',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#223550',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  btnPrimary: {
    backgroundColor: '#1a273e',
  },
  cornerBtn: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignSelf: 'center',
  },
  btnActive: {
    backgroundColor: '#00f0ff',
    borderColor: '#ffffff',
    transform: [{ scale: 0.94 }],
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  btnDisabled: {
    opacity: 0.2,
  },
  primaryArrowText: {
    fontSize: 32,
    color: '#00f0ff',
    fontWeight: '900',
  },
  arrowText: {
    fontSize: 22,
    color: '#64748b',
    fontWeight: '700',
  },
  centerStopBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#b91c1c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  centerStopBtnActive: {
    backgroundColor: '#ef4444',
    transform: [{ scale: 0.93 }],
    shadowOpacity: 0.9,
    shadowRadius: 16,
  },
  centerStopText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
});
