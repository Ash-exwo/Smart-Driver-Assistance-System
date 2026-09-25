import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Header } from './src/components/Header';
import { StatusBanner } from './src/components/StatusBanner';
import { SonarDisplay } from './src/components/SonarDisplay';
import { DPadController } from './src/components/DPadController';
import { VirtualJoystick } from './src/components/VirtualJoystick';
import { SpeedControl } from './src/components/SpeedControl';
import { EmergencyButton } from './src/components/EmergencyButton';
import { SettingsModal } from './src/components/SettingsModal';
import { DmsAiCard } from './src/components/DmsAiCard';
import { roverService, DEFAULT_SETTINGS } from './src/services/RoverService';
import {
  CarState,
  ConnectionStatus,
  DriveCommand,
  DriveMode,
  TelemetryData,
  AppSettings,
  DmsTelemetry,
} from './src/types';

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTING');
  const [latencyMs, setLatencyMs] = useState<number>(-1);
  const [carState, setCarState] = useState<CarState>('IDLE');
  const [frontDist, setFrontDist] = useState<number>(200);
  const [leftDist, setLeftDist] = useState<number>(200);
  const [currentSpeed, setCurrentSpeed] = useState<number>(180);
  const [driveMode, setDriveMode] = useState<DriveMode>('DPAD');
  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [dmsData, setDmsData] = useState<DmsTelemetry | null>(null);
  const [dmsConnected, setDmsConnected] = useState<boolean>(false);

  const consecutiveFailures = useRef<number>(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Telemetry Polling Loop ---
  const pollTelemetry = useCallback(async () => {
    const startTime = Date.now();
    const data = await roverService.fetchStatus();

    if (data) {
      consecutiveFailures.current = 0;
      setConnectionStatus('CONNECTED');
      setCarState(data.state);
      setFrontDist(data.front);
      setLeftDist(data.left);
      setLatencyMs(Date.now() - startTime);
    } else {
      consecutiveFailures.current += 1;
      if (consecutiveFailures.current >= 3) {
        setConnectionStatus('DISCONNECTED');
        setLatencyMs(-1);
      }
    }

    // Poll DMS AI if enabled
    if (settings.enableDms) {
      const dms = await roverService.fetchDmsTelemetry();
      if (dms) {
        setDmsConnected(true);
        setDmsData(dms);
        if (dms.driver_condition.includes('CRITICAL')) {
          setCarState('HALTED');
        }
      } else {
        setDmsConnected(false);
      }
    }
  }, [currentSpeed, settings.enableDms]);

  useEffect(() => {
    roverService.updateSettings(settings);

    // Initial poll and recurring timer
    pollTelemetry();
    pollTimerRef.current = setInterval(pollTelemetry, settings.pollIntervalMs);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [settings, pollTelemetry]);

  // --- Drive Handlers ---
  const handleCommandStart = (cmd: DriveCommand) => {
    roverService.sendCommand(cmd, currentSpeed);
  };

  const handleCommandEnd = () => {
    roverService.sendCommand('S');
  };

  const handleDifferentialDrive = (left: number, right: number) => {
    roverService.sendDifferentialDrive(left, right);
  };

  const handleEmergencyStop = async () => {
    await roverService.sendEmergencyStop();
    setCarState('HALTED');
  };

  const handleResetPower = async () => {
    await roverService.sendReset();
    setCarState('IDLE');
  };

  const handleSpeedChange = (newSpeed: number) => {
    setCurrentSpeed(newSpeed);
    roverService.syncSettings(newSpeed, 155, settings.autoBrake, settings.watchdogMs);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    roverService.updateSettings(newSettings);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      {/* Header with Connection & Status */}
      <Header
        connectionStatus={connectionStatus}
        latencyMs={latencyMs}
        isSimulated={settings.simulationMode}
        onOpenSettings={() => setSettingsModalVisible(true)}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* State Banner with Microsleep Warning / Arming button */}
        <StatusBanner
          state={carState}
          onRearm={handleResetPower}
          autoBraked={settings.autoBrake && frontDist < 18 && carState === 'MANUAL'}
        />

        {/* AI Driver Monitoring System (DMS) Card */}
        {settings.enableDms && (
          <DmsAiCard dmsData={dmsData} dmsConnected={dmsConnected} />
        )}

        {/* Dual Sonar Proximity Telemetry */}
        <SonarDisplay frontDist={frontDist} leftDist={leftDist} />

        {/* Drive Mode Selector Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, driveMode === 'DPAD' && styles.tabButtonActive]}
            onPress={() => setDriveMode('DPAD')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, driveMode === 'DPAD' && styles.tabTextActive]}>
              TACTICAL D-PAD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, driveMode === 'JOYSTICK' && styles.tabButtonActive]}
            onPress={() => setDriveMode('JOYSTICK')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, driveMode === 'JOYSTICK' && styles.tabTextActive]}>
              VIRTUAL JOYSTICK
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Controller Mode */}
        <View style={styles.controlStage}>
          {driveMode === 'DPAD' ? (
            <DPadController
              onCommandStart={handleCommandStart}
              onCommandEnd={handleCommandEnd}
              carState={carState}
              hapticsEnabled={settings.hapticsEnabled}
              commandRateMs={settings.commandRateMs}
            />
          ) : (
            <VirtualJoystick
              onDriveChange={handleDifferentialDrive}
              maxSpeed={currentSpeed}
              carState={carState}
            />
          )}
        </View>

        {/* Speed Limit & Gear Selector */}
        <SpeedControl
          currentSpeed={currentSpeed}
          onSpeedChange={handleSpeedChange}
        />
      </ScrollView>

      {/* Fixed Sticky Emergency Stop Button */}
      <EmergencyButton
        carState={carState}
        onEmergencyStop={handleEmergencyStop}
        onResetPower={handleResetPower}
        hapticsEnabled={settings.hapticsEnabled}
      />

      {/* Configuration & Diagnostics Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#00f0ff',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  tabTextActive: {
    color: '#00f0ff',
  },
  controlStage: {
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
