import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SonarDisplayProps {
  frontDist: number;
  leftDist: number;
}

export const SonarDisplay: React.FC<SonarDisplayProps> = ({ frontDist, leftDist }) => {
  const getProximityStatus = (dist: number) => {
    if (dist <= 0) return { label: 'OUT OF RANGE', color: '#64748b', percent: 0, level: 'safe' };
    if (dist < 20) return { label: 'CRITICAL', color: '#ef4444', percent: Math.max(10, (dist / 20) * 100), level: 'danger' };
    if (dist < 50) return { label: 'CAUTION', color: '#f59e0b', percent: Math.min(100, (dist / 50) * 100), level: 'caution' };
    return { label: 'CLEAR', color: '#00f0ff', percent: Math.min(100, (dist / 150) * 100), level: 'safe' };
  };

  const frontStatus = getProximityStatus(frontDist);
  const leftStatus = getProximityStatus(leftDist);

  return (
    <View style={styles.container}>
      {/* Front Sonar Card */}
      <View style={[styles.card, frontStatus.level === 'danger' && styles.cardDanger]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>FRONT SONAR</Text>
          <View style={[styles.statusTag, { backgroundColor: frontStatus.color + '22', borderColor: frontStatus.color }]}>
            <Text style={[styles.statusTagText, { color: frontStatus.color }]}>{frontStatus.label}</Text>
          </View>
        </View>

        <View style={styles.valueRow}>
          <Text style={[styles.distValue, { color: frontStatus.color }]}>
            {frontDist > 0 ? frontDist : '--'}
          </Text>
          <Text style={styles.unitText}>cm</Text>
        </View>

        {/* Visual Proximity Meter Bar */}
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, Math.max(8, frontStatus.percent))}%`,
                backgroundColor: frontStatus.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Center Vehicle Mini Icon with Radar Rays */}
      <View style={styles.vehicleCenter}>
        <View style={[styles.sensorBeacon, { borderColor: frontStatus.color }]}>
          <Text style={styles.beaconText}>▲</Text>
        </View>
        <View style={styles.vehicleBody}>
          <Text style={styles.vehicleText}>ROVER</Text>
        </View>
        <View style={[styles.sensorBeaconLeft, { borderColor: leftStatus.color }]}>
          <Text style={styles.beaconText}>◀</Text>
        </View>
      </View>

      {/* Left Sonar Card */}
      <View style={[styles.card, leftStatus.level === 'danger' && styles.cardDanger]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>LEFT SONAR</Text>
          <View style={[styles.statusTag, { backgroundColor: leftStatus.color + '22', borderColor: leftStatus.color }]}>
            <Text style={[styles.statusTagText, { color: leftStatus.color }]}>{leftStatus.label}</Text>
          </View>
        </View>

        <View style={styles.valueRow}>
          <Text style={[styles.distValue, { color: leftStatus.color }]}>
            {leftDist > 0 ? leftDist : '--'}
          </Text>
          <Text style={styles.unitText}>cm</Text>
        </View>

        {/* Visual Proximity Meter Bar */}
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, Math.max(8, leftStatus.percent))}%`,
                backgroundColor: leftStatus.color,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 4,
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#111927',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardDanger: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  distValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  meterTrack: {
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 2,
  },
  vehicleCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 70,
    position: 'relative',
  },
  vehicleBody: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  sensorBeacon: {
    position: 'absolute',
    top: 2,
    borderWidth: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#0d131f',
  },
  sensorBeaconLeft: {
    position: 'absolute',
    left: -4,
    borderWidth: 1,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#0d131f',
  },
  beaconText: {
    fontSize: 8,
    color: '#94a3b8',
  },
});
