import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Spot } from '../types';

interface SpotCardProps {
  spot: Spot;
  index: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function SpotCard({ spot, index, onPress, onLongPress }: SpotCardProps) {
  const formatTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const openMap = () => {
    const query = spot.address || spot.name;
    const url = `https://maps.google.com/?q=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={200}
    >
      <View style={styles.orderContainer}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{index + 1}</Text>
        </View>
        {index > 0 && <View style={styles.connector} />}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {spot.name}
        </Text>
        {spot.address && (
          <Text style={styles.address} numberOfLines={1}>
            {spot.address}
          </Text>
        )}
        <View style={styles.timeRow}>
          {spot.startTime && <Text style={styles.time}>{formatTime(spot.startTime)}</Text>}
          {spot.startTime && spot.endTime && <Text style={styles.timeSeparator}>-</Text>}
          {spot.endTime && <Text style={styles.time}>{formatTime(spot.endTime)}</Text>}
        </View>
        {spot.memo && (
          <Text style={styles.memo} numberOfLines={2}>
            {spot.memo}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.mapButton} onPress={openMap} activeOpacity={0.7}>
        <Ionicons name="location" size={20} color="#3B82F6" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  connector: {
    position: 'absolute',
    top: -12,
    width: 2,
    height: 12,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
  },
  mapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    alignSelf: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  memo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
