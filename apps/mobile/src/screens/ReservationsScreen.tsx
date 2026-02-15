import { useNavigation, useRoute } from '@react-navigation/native';
import type React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import * as reservationsApi from '../api/reservations';
import { EmptyState, FAB, ReservationCard } from '../components';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import { useFocusData } from '../hooks/useFocusData';
import type { TripTabScreenProps } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import type { Reservation } from '../types';
import { formatDateShort } from '../utils/date';

type Props = TripTabScreenProps<'Reservations'>;

export function ReservationsScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const {
    data: reservations,
    loading,
    setData: setReservations,
  } = useFocusData(() => reservationsApi.getReservations(tripId), [tripId]);

  const items = reservations ?? [];

  const { confirmDelete } = useDeleteConfirmation<Reservation>(
    (id) => reservationsApi.deleteReservation(tripId, id),
    ((updater: React.SetStateAction<Reservation[]>) =>
      setReservations((prev) => {
        const current = prev ?? [];
        return typeof updater === 'function' ? updater(current) : updater;
      })) as React.Dispatch<React.SetStateAction<Reservation[]>>,
  );

  const groupedReservations = items.reduce(
    (acc, reservation) => {
      if (!reservation.datetime) {
        const key = 'その他';
        if (!acc[key]) acc[key] = [];
        acc[key].push(reservation);
        return acc;
      }

      const key = formatDateShort(reservation.datetime);
      if (!acc[key]) acc[key] = [];
      acc[key].push(reservation);
      return acc;
    },
    {} as Record<string, Reservation[]>,
  );

  const sortedGroups = Object.entries(groupedReservations).sort((a, b) => {
    if (a[0] === 'その他') return 1;
    if (b[0] === 'その他') return -1;
    return a[0].localeCompare(b[0]);
  });

  const handleReservationPress = (reservation: Reservation) => {
    confirmDelete(
      reservation,
      reservation.name,
      `予約番号: ${reservation.confirmationNumber || 'なし'}\n${reservation.memo || ''}`,
    );
  };

  const handleAddReservation = () => {
    navigation.navigate('AddReservation', { tripId });
  };

  const renderSectionHeader = (date: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{date}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length > 0 && <Text style={styles.hintText}>タップで詳細・削除</Text>}

      <FlatList
        data={sortedGroups}
        keyExtractor={([date]) => date}
        renderItem={({ item: [date, items] }) => (
          <View>
            {renderSectionHeader(date)}
            {items
              .sort((a, b) => {
                if (!a.datetime) return 1;
                if (!b.datetime) return -1;
                return a.datetime.localeCompare(b.datetime);
              })
              .map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onPress={() => handleReservationPress(reservation)}
                />
              ))}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <EmptyState
            icon="document-text-outline"
            message={`予約情報がありません\n+ ボタンから追加しましょう`}
          />
        )}
      />

      <FAB onPress={handleAddReservation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    paddingBottom: 100,
  },
  sectionHeader: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    marginTop: spacing.md,
  },
  sectionHeaderText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
  },
});
