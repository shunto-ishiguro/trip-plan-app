import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as spotsApi from '../api/spots';
import { EmptyState, FAB, SpotCard } from '../components';
import { useTrip } from '../contexts/TripContext';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import type { TripTabScreenProps } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import type { Spot } from '../types';

type Props = TripTabScreenProps<'Schedule'>;

export function ScheduleScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const { trip } = useTrip();

  const days = useMemo(() => {
    if (!trip) return [0];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    return Array.from({ length: diffDays }, (_, i) => i);
  }, [trip]);

  const [selectedDay, setSelectedDay] = useState(0);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpots = useCallback(async () => {
    try {
      const data = await spotsApi.getSpots(tripId, selectedDay);
      setSpots(data);
    } catch {
      setSpots([]);
    } finally {
      setLoading(false);
    }
  }, [tripId, selectedDay]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchSpots();
    }, [fetchSpots]),
  );

  const handleSpotPress = (spot: Spot) => {
    Alert.alert(spot.name, spot.memo || spot.address || '');
  };

  const { confirmDelete } = useDeleteConfirmation<Spot>(
    (id) => spotsApi.deleteSpot(tripId, id),
    setSpots,
  );

  const handleSpotLongPress = (spot: Spot) => {
    confirmDelete(spot, spot.name);
  };

  const handleAddSpot = () => {
    navigation.navigate('AddSpot', { tripId, dayIndex: selectedDay });
  };

  return (
    <View style={styles.container}>
      <View style={styles.dayTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabs}
        >
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayTab, selectedDay === day && styles.dayTabActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayTabText, selectedDay === day && styles.dayTabTextActive]}>
                Day {day + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SpotCard
              spot={item}
              index={index}
              onPress={() => handleSpotPress(item)}
              onLongPress={() => handleSpotLongPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            spots.length > 0 ? <Text style={styles.hintText}>長押しで削除できます</Text> : null
          }
          ListEmptyComponent={() => (
            <EmptyState
              icon="location-outline"
              message={`スポットがありません\n+ ボタンから追加しましょう`}
            />
          )}
        />
      )}

      <FAB onPress={handleAddSpot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  dayTabsContainer: {
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  dayTabs: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    gap: spacing.md,
    flexDirection: 'row',
  },
  dayTab: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius['3xl'],
    backgroundColor: colors.background.elevated,
  },
  dayTabActive: {
    backgroundColor: colors.accent,
  },
  dayTabText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.tertiary,
  },
  dayTabTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.quaternary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  listContent: {
    paddingVertical: spacing.base,
    paddingBottom: 100,
  },
});
