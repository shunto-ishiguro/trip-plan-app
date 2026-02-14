import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, gradients, radius, shadows, spacing, typography } from '../theme';
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

const TYPE_GRADIENT_KEYS: Record<Reservation['type'], keyof typeof gradients> = {
  flight: 'flight',
  hotel: 'hotel',
  rental_car: 'rental_car',
  restaurant: 'restaurant',
  activity: 'activityReservation',
  other: 'otherReservation',
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

  const badgeGradient = gradients[TYPE_GRADIENT_KEYS[reservation.type]];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <LinearGradient
          colors={[...badgeGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.typeBadge}
        >
          <Ionicons
            name={TYPE_ICONS[reservation.type]}
            size={14}
            color="#fff"
            style={styles.typeIcon}
          />
          <Text style={styles.typeText}>{TYPE_LABELS[reservation.type]}</Text>
        </LinearGradient>
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
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    padding: 14,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xl,
  },
  typeIcon: {
    marginRight: 4,
  },
  typeText: {
    fontSize: typography.fontSizes.sm,
    color: '#fff',
    fontWeight: typography.fontWeights.medium,
  },
  datetime: {
    fontSize: typography.fontSizes.md,
    color: colors.accent,
    marginLeft: 'auto',
    fontWeight: typography.fontWeights.medium,
  },
  name: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: spacing.md,
  },
  confirmationLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    marginRight: spacing.md,
  },
  confirmationNumber: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  copyHint: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.quaternary,
    marginLeft: 'auto',
  },
  memo: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
