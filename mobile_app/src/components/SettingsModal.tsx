import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AppSettings } from '../types';
import { roverService } from '../services/RoverService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [ip, setIp] = useState(settings.roverIp);
  const [simulationMode, setSimulationMode] = useState(settings.simulationMode);
  const [autoBrake, setAutoBrake] = useState(settings.autoBrake);
  const [hapticsEnabled, setHapticsEnabled] = useState(settings.hapticsEnabled);
  const [enableDms, setEnableDms] = useState(settings.enableDms ?? true);
  const [dmsUrl, setDmsUrl] = useState(settings.dmsUrl || 'http://127.0.0.1:8000');
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult(null);
    roverService.updateSettings({ roverIp: ip, simulationMode });
    const res = await roverService.measurePing();
    setTestingPing(false);
    if (res.ok) {
      setPingResult(`Connected! Latency: ${res.latencyMs} ms`);
    } else {
      setPingResult('Connection failed. Make sure your phone is connected to "ESP32-Safety-Car" Wi-Fi.');
    }
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      roverIp: ip,
      simulationMode,
      autoBrake,
      hapticsEnabled,
      enableDms,
      dmsUrl,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ROVER SETTINGS</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* IP Address Section */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>ESP32 GATEWAY IP / URL</Text>
              <TextInput
                style={styles.input}
                value={ip}
                onChangeText={setIp}
                placeholder="http://192.168.4.1"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.helperText}>
                Default AP Gateway is http://192.168.4.1 (Password: 12345678)
              </Text>
            </View>

            {/* Test Connection Button */}
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestPing}
              disabled={testingPing}
              activeOpacity={0.8}
            >
              {testingPing ? (
                <ActivityIndicator color="#00f0ff" size="small" />
              ) : (
                <Text style={styles.testBtnText}>TEST CONNECTION (PING)</Text>
              )}
            </TouchableOpacity>

            {pingResult && (
              <View
                style={[
                  styles.pingBanner,
                  pingResult.includes('Connected') ? styles.pingSuccess : styles.pingError,
                ]}
              >
                <Text
                  style={[
                    styles.pingText,
                    pingResult.includes('Connected') ? styles.pingSuccessText : styles.pingErrorText,
                  ]}
                >
                  {pingResult}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            {/* Simulation Demo Mode */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Text style={styles.switchLabel}>Simulation Demo Mode</Text>
                <Text style={styles.switchDesc}>
                  Test gauges, controls, and radar without connecting to hardware
                </Text>
              </View>
              <Switch
                value={simulationMode}
                onValueChange={setSimulationMode}
                trackColor={{ false: '#334155', true: '#00f0ff' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Obstacle Auto-Brake */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Text style={styles.switchLabel}>Obstacle Auto-Brake</Text>
                <Text style={styles.switchDesc}>
                  Automatically halt motors if front ultrasonic sensor detects obstacle &lt; 18cm
                </Text>
              </View>
              <Switch
                value={autoBrake}
                onValueChange={setAutoBrake}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Haptic Feedback */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Text style={styles.switchLabel}>Haptic Feedback</Text>
                <Text style={styles.switchDesc}>
                  Tactile vibrations on button presses and emergency alerts
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: '#334155', true: '#00f0ff' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.divider} />

            {/* AI Driver Monitoring System (DMS) */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Text style={styles.switchLabel}>AI Driver Monitor (DMS)</Text>
                <Text style={styles.switchDesc}>
                  Connect to camera fatigue, eye-closure, and pothole detection server
                </Text>
              </View>
              <Switch
                value={enableDms}
                onValueChange={setEnableDms}
                trackColor={{ false: '#334155', true: '#00f0ff' }}
                thumbColor="#ffffff"
              />
            </View>

            {enableDms && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>DMS SERVER URL / IP</Text>
                <TextInput
                  style={styles.input}
                  value={dmsUrl}
                  onChangeText={setDmsUrl}
                  placeholder="http://127.0.0.1:8000"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.helperText}>
                  Laptop IP running drowsiness_detector.py (e.g. http://192.168.4.2:8000)
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>SAVE & APPLY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0d131f',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    maxHeight: '88%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#111827',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00f0ff',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#94a3b8',
  },
  body: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  testBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#00f0ff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  testBtnText: {
    color: '#00f0ff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  pingBanner: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  pingSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  pingError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  pingText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  pingSuccessText: {
    color: '#10b981',
  },
  pingErrorText: {
    color: '#f87171',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabelWrap: {
    flex: 1,
    marginRight: 14,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  switchDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 12,
    backgroundColor: '#111827',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontWeight: '800',
    fontSize: 12,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#00f0ff',
  },
  saveBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 12,
  },
});
