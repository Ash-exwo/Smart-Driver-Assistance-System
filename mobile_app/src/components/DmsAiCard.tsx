import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DmsTelemetry } from '../types';

interface DmsAiCardProps {
  dmsData: DmsTelemetry | null;
  dmsConnected: boolean;
}

export const DmsAiCard: React.FC<DmsAiCardProps> = ({ dmsData, dmsConnected }) => {
  const [expanded, setExpanded] = useState(false);

  if (!dmsConnected || !dmsData) {
    return (
      <View style={styles.containerInactive}>
        <View style={styles.inactiveRow}>
          <View style={styles.dotOffline} />
          <Text style={styles.inactiveText}>AI DRIVER MONITOR: WAITING FOR DMS STREAM</Text>
        </View>
      </View>
    );
  }

  const isCritical = dmsData.driver_condition.includes('CRITICAL');
  const isWarning = dmsData.driver_condition.includes('WARNING');
  const level = dmsData.drowsiness_level;

  const getConditionColor = () => {
    if (isCritical) return '#ef4444';
    if (isWarning) return '#f59e0b';
    return '#10b981';
  };

  return (
    <View style={[styles.container, isCritical && styles.containerCritical]}>
      {/* Header Row */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.titleGroup}>
          <View style={[styles.dotOnline, { backgroundColor: getConditionColor() }]} />
          <Text style={styles.title}>AI DRIVER MONITOR (DMS)</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: getConditionColor() + '22', borderColor: getConditionColor() },
            ]}
          >
            <Text style={[styles.badgeText, { color: getConditionColor() }]}>
              {dmsData.driver_condition}
            </Text>
          </View>
        </View>

        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Drowsiness Progress Meter */}
      <View style={styles.meterContainer}>
        <View style={styles.meterHeader}>
          <Text style={styles.meterLabel}>DROWSINESS LEVEL</Text>
          <Text style={[styles.meterValue, { color: getConditionColor() }]}>
            {level}%
          </Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${Math.min(100, Math.max(5, level))}%`, backgroundColor: getConditionColor() },
            ]}
          />
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.detailsGrid}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>EYES</Text>
            <Text
              style={[
                styles.detailVal,
                dmsData.eye_status === 'CLOSED' && styles.textRed,
              ]}
            >
              {dmsData.eye_status}
            </Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>YAWNING</Text>
            <Text
              style={[
                styles.detailVal,
                dmsData.yawning === 'YES' && styles.textAmber,
              ]}
            >
              {dmsData.yawning}
            </Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>ROAD HAZARDS</Text>
            <Text
              style={[
                styles.detailVal,
                dmsData.pothole_detected && styles.textAmber,
              ]}
            >
              {dmsData.pothole_count} Potholes
            </Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>BLINKS / MIN</Text>
            <Text style={styles.detailVal}>{dmsData.eye_blinks}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
  },
  containerCritical: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  containerInactive: {
    backgroundColor: '#0a0f1d',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 8,
  },
  inactiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOffline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748b',
    marginRight: 8,
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dotOnline: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expandIcon: {
    fontSize: 12,
    color: '#64748b',
    paddingLeft: 8,
  },
  meterContainer: {
    marginTop: 8,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  meterLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  meterValue: {
    fontSize: 11,
    fontWeight: '900',
  },
  track: {
    height: 5,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 6,
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#162235',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00f0ff',
    marginTop: 2,
  },
  textRed: {
    color: '#ef4444',
  },
  textAmber: {
    color: '#f59e0b',
  },
});
