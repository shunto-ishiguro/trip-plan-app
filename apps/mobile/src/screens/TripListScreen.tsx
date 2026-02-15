import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as tripsApi from '../api/trips';
import { FAB, TripCard } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import type { Trip } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TripListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      const data = await tripsApi.getTrips();
      setTrips(data);
    } catch {
      // silently fail — empty list shown
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [fetchTrips]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripDetail', {
      tripId: trip.id,
      tripTitle: trip.title,
      screen: 'Schedule',
      params: { tripId: trip.id },
    });
  };

  const handleCreateTrip = () => {
    navigation.navigate('TripCreate');
  };

  const handleJoinTrip = () => {
    navigation.navigate('JoinTrip');
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="map-outline"
        size={48}
        color={colors.text.tertiary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>旅行がありません</Text>
      <Text style={styles.emptyText}>右下の + ボタンから{'\n'}新しい旅行を作成しましょう</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>旅行一覧</Text>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinTrip}>
            <Ionicons name="enter-outline" size={18} color={colors.accent} />
            <Text style={styles.joinButtonText}>参加する</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>旅行一覧</Text>
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinTrip}>
          <Ionicons name="enter-outline" size={18} color={colors.accent} />
          <Text style={styles.joinButtonText}>参加する</Text>
        </TouchableOpacity>
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
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: typography.fontSizes['5xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  joinButtonText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.accent,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: spacing.md,
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
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
