import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Reservation } from '../types';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface ReservationCardProps {
  reservation: Reservation;
  onPress: () => void;
}

const TYPE_LABELS: Record<Reservation['type'], string> = {
  flight: '航空',
  hotel: 'ホテル',
  rental_car: 'レンタカー',
  restaurant: 'レストラン',
  activity: 'アクティビティ',
  other: 'その他',
};

const TYPE_ICONS: Record<Reservation['type'], IoniconsName> = {
  flight: 'airplane-outline',
  hotel: 'bed-outline',
  rental_car: 'car-outline',
  restaurant: 'restaurant-outline',
  activity: 'ticket-outline',
  other: 'document-text-outline',
};

const TYPE_COLORS: Record<Reservation['type'], string> = {
  flight: '#3B82F6',
  hotel: '#8B5CF6',
  rental_car: '#10B981',
  restaurant: '#F59E0B',
  activity: '#EC4899',
  other: '#6B7280',
};

export function ReservationCard({ reservation, onPress }: ReservationCardProps) {
  const handleCopyConfirmation = async () => {
    if (reservation.confirmationNumber) {
      await Clipboard.setStringAsync(reservation.confirmationNumber);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const formatDatetime = (datetime?: string) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Ionicons
          name={TYPE_ICONS[reservation.type]}
          size={18}
          color={TYPE_COLORS[reservation.type]}
          style={styles.icon}
        />
        <Text style={styles.type}>{TYPE_LABELS[reservation.type]}</Text>
        {reservation.datetime && (
          <Text style={styles.datetime}>{formatDatetime(reservation.datetime)}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {reservation.name}
      </Text>
      {reservation.confirmationNumber && (
        <TouchableOpacity
          style={styles.confirmationRow}
          onLongPress={handleCopyConfirmation}
          delayLongPress={300}
        >
          <Text style={styles.confirmationLabel}>予約番号</Text>
          <Text style={styles.confirmationNumber}>{reservation.confirmationNumber}</Text>
          <Text style={styles.copyHint}>長押しでコピー</Text>
        </TouchableOpacity>
      )}
      {reservation.memo && (
        <Text style={styles.memo} numberOfLines={2}>
          {reservation.memo}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  type: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  datetime: {
    fontSize: 13,
    color: '#3B82F6',
    marginLeft: 'auto',
    fontWeight: '500',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  confirmationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  confirmationNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'monospace',
  },
  copyHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
  memo: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
