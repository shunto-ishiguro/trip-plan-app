import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, TripCard } from '../components';
import type { RootStackParamList } from '../navigation/types';
import type { Trip } from '../types';

// モックデータ
const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    title: '京都旅行',
    destination: '京都府',
    startDate: '2026-03-15',
    endDate: '2026-03-17',
    memberCount: 2,
    memo: '桜の時期に合わせて',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: '沖縄家族旅行',
    destination: '沖縄県',
    startDate: '2026-07-20',
    endDate: '2026-07-24',
    memberCount: 4,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: '3',
    title: '北海道グルメ旅',
    destination: '北海道',
    startDate: '2026-09-01',
    endDate: '2026-09-04',
    memberCount: 3,
    memo: '海鮮とラーメンを堪能',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TripListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [trips] = useState<Trip[]>(MOCK_TRIPS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: API呼び出し
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    setRefreshing(false);
  };

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripDetail', {
      tripId: trip.id,
      screen: 'Schedule',
      params: { tripId: trip.id },
    });
  };

  const handleCreateTrip = () => {
    navigation.navigate('TripCreate');
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🗺️</Text>
      <Text style={styles.emptyTitle}>旅行がありません</Text>
      <Text style={styles.emptyText}>右下の + ボタンから{'\n'}新しい旅行を作成しましょう</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>旅行一覧</Text>
      </View>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard trip={item} onPress={() => handleTripPress(item)} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={
          trips.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyList}
      />
      <FAB onPress={handleCreateTrip} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 100,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
