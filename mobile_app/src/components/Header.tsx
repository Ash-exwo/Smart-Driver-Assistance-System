import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  latencyMs: number;
  isSimulated: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  latencyMs,
  isSimulated,
  onOpenSettings,
}) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return '#10b981'; // Emerald
      case 'CONNECTING':
        return '#f59e0b'; // Amber
      case 'DISCONNECTED':
      default:
        return '#ef4444'; // Red
    }
  };

  const getStatusText = () => {
    if (isSimulated) return 'SIMULATOR ACTIVE';
    switch (connectionStatus) {
      case 'CONNECTED':
        return `CONNECTED (${latencyMs >= 0 ? latencyMs + 'ms' : '--'})`;
      case 'CONNECTING':
        return 'CONNECTING...';
      case 'DISCONNECTED':
      default:
        return 'DISCONNECTED';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <View style={styles.logoRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.appName}>ROVER COCKPIT</Text>
          <View style={styles.badgeVersion}>
            <Text style={styles.badgeVersionText}>v2.0</Text>
          </View>
        </View>
        <Text style={[styles.statusSubtext, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onOpenSettings}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsIcon}>⚙</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0d131f',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  titleSection: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00f0ff',
    letterSpacing: 1.2,
  },
  badgeVersion: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  badgeVersionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00f0ff',
  },
  statusSubtext: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsIcon: {
    fontSize: 20,
    color: '#94a3b8',
  },
});
