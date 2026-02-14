import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, gradients, radius, shadows, spacing, typography } from '../theme';
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
        <LinearGradient
          colors={[gradients.primary[0], gradients.primary[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orderBadge}
        >
          <Text style={styles.orderText}>{index + 1}</Text>
        </LinearGradient>
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
        <Ionicons name="location" size={20} color={colors.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    padding: spacing.base,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  orderContainer: {
    alignItems: 'center',
    marginRight: spacing.base,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: '#fff',
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
  },
  connector: {
    position: 'absolute',
    top: -12,
    width: 2,
    height: 12,
    backgroundColor: colors.border.primary,
  },
  content: {
    flex: 1,
  },
  mapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
    alignSelf: 'center',
  },
  name: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  address: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: typography.fontSizes.md,
    color: colors.accent,
    fontWeight: typography.fontWeights.medium,
  },
  timeSeparator: {
    fontSize: typography.fontSizes.md,
    color: colors.text.quaternary,
    marginHorizontal: spacing.xs,
  },
  memo: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
