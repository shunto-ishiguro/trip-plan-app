import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme';
import type { Trip } from '../types';
import { formatDateShort } from '../utils/date';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const formatDateRange = (start: string, end: string) =>
    `${formatDateShort(start)} - ${formatDateShort(end)}`;

  const getDaysCount = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays}日間`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {trip.title}
        </Text>
        <Text style={styles.days}>{getDaysCount(trip.startDate, trip.endDate)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>行き先</Text>
          <Text style={styles.value}>{trip.destination}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>日程</Text>
          <Text style={styles.value}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>人数</Text>
          <Text style={styles.value}>{trip.memberCount}人</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  days: {
    fontSize: typography.fontSizes.base,
    color: colors.accent,
    fontWeight: typography.fontWeights.medium,
    marginLeft: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    width: 50,
  },
  value: {
    fontSize: typography.fontSizes.base,
    color: colors.text.secondary,
  },
});
