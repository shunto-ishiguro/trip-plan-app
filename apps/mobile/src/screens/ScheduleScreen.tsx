import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FAB, SpotCard } from '../components';
import type { TripTabScreenProps } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import type { Spot } from '../types';

// モックデータ
const MOCK_SPOTS: Record<number, Spot[]> = {
  0: [
    {
      id: '1',
      tripId: '1',
      dayIndex: 0,
      order: 0,
      name: '京都駅',
      address: '京都府京都市下京区',
      startTime: '10:00',
      memo: '新幹線到着',
    },
    {
      id: '2',
      tripId: '1',
      dayIndex: 0,
      order: 1,
      name: '清水寺',
      address: '京都府京都市東山区清水1丁目294',
      startTime: '11:30',
      endTime: '13:00',
    },
    {
      id: '3',
      tripId: '1',
      dayIndex: 0,
      order: 2,
      name: '祇園',
      address: '京都府京都市東山区祇園町',
      startTime: '14:00',
      endTime: '16:00',
      memo: '昼食とお散歩',
    },
  ],
  1: [
    {
      id: '4',
      tripId: '1',
      dayIndex: 1,
      order: 0,
      name: '金閣寺',
      address: '京都府京都市北区金閣寺町1',
      startTime: '09:00',
      endTime: '10:30',
    },
    {
      id: '5',
      tripId: '1',
      dayIndex: 1,
      order: 1,
      name: '嵐山',
      address: '京都府京都市右京区嵯峨',
      startTime: '12:00',
      endTime: '16:00',
      memo: '竹林の道を散策',
    },
  ],
  2: [
    {
      id: '6',
      tripId: '1',
      dayIndex: 2,
      order: 0,
      name: '伏見稲荷大社',
      address: '京都府京都市伏見区深草藪之内町68',
      startTime: '09:00',
      endTime: '11:00',
    },
  ],
};

type Props = TripTabScreenProps<'Schedule'>;

export function ScheduleScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [selectedDay, setSelectedDay] = useState(0);
  const days = [0, 1, 2]; // TODO: 実際の日数を計算

  const spots = MOCK_SPOTS[selectedDay] || [];

  const handleSpotPress = (spot: Spot) => {
    Alert.alert(spot.name, spot.memo || spot.address || '');
  };

  const handleSpotLongPress = (spot: Spot) => {
    Alert.alert(spot.name, '操作を選択', [
      { text: '編集', onPress: () => console.log('Edit', spot.id) },
      { text: '削除', style: 'destructive', onPress: () => console.log('Delete', spot.id) },
      { text: 'キャンセル', style: 'cancel' },
    ]);
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
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>
              スポットがありません{'\n'}+ ボタンから追加しましょう
            </Text>
          </View>
        )}
      />

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
    borderRadius: 20,
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
    color: '#fff',
  },
  listContent: {
    paddingVertical: spacing.base,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.base,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
