import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { FAB, ReservationCard } from '../components';
import type { TripTabScreenProps } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import type { Reservation } from '../types';

// モックデータ
const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    tripId: '1',
    type: 'flight',
    name: 'ANA 123便 羽田→伊丹',
    confirmationNumber: 'ABC123DEF',
    datetime: '2026-03-15T08:00:00',
    memo: '第2ターミナル',
  },
  {
    id: '2',
    tripId: '1',
    type: 'hotel',
    name: '京都グランドホテル',
    confirmationNumber: 'KGH-2026-0315',
    datetime: '2026-03-15T15:00:00',
    memo: 'チェックイン15時〜',
    link: 'https://example.com/hotel',
  },
  {
    id: '3',
    tripId: '1',
    type: 'restaurant',
    name: '祇園 懐石料理 さくら',
    confirmationNumber: '0315-1900',
    datetime: '2026-03-15T19:00:00',
    memo: '2名様 カウンター席',
  },
  {
    id: '4',
    tripId: '1',
    type: 'activity',
    name: '着物レンタル きもの館',
    confirmationNumber: 'KM-20260316',
    datetime: '2026-03-16T09:00:00',
  },
  {
    id: '5',
    tripId: '1',
    type: 'flight',
    name: 'ANA 456便 伊丹→羽田',
    confirmationNumber: 'XYZ789GHI',
    datetime: '2026-03-17T18:00:00',
  },
];

type Props = TripTabScreenProps<'Reservations'>;

export function ReservationsScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [reservations] = useState<Reservation[]>(MOCK_RESERVATIONS);

  // 日付でグループ化
  const groupedReservations = reservations.reduce(
    (acc, reservation) => {
      if (!reservation.datetime) {
        const key = 'その他';
        if (!acc[key]) acc[key] = [];
        acc[key].push(reservation);
        return acc;
      }

      const date = new Date(reservation.datetime);
      const key = `${date.getMonth() + 1}/${date.getDate()}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(reservation);
      return acc;
    },
    {} as Record<string, Reservation[]>,
  );

  // 日付順にソート
  const sortedGroups = Object.entries(groupedReservations).sort((a, b) => {
    if (a[0] === 'その他') return 1;
    if (b[0] === 'その他') return -1;
    return a[0].localeCompare(b[0]);
  });

  const handleReservationPress = (reservation: Reservation) => {
    Alert.alert(
      reservation.name,
      `予約番号: ${reservation.confirmationNumber || 'なし'}\n${reservation.memo || ''}`,
      [
        { text: '編集', onPress: () => console.log('Edit', reservation.id) },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => console.log('Delete', reservation.id),
        },
        { text: '閉じる', style: 'cancel' },
      ],
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

  return (
    <View style={styles.container}>
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
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.text.quaternary} />
            <Text style={styles.emptyText}>
              予約情報がありません{'\n'}+ ボタンから追加しましょう
            </Text>
          </View>
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
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: spacing.base,
    fontSize: typography.fontSizes.lg,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
