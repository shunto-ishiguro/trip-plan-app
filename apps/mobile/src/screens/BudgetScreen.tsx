import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { BudgetItemCard, FAB } from '../components';
import type { TripTabScreenProps } from '../navigation/types';
import type { BudgetItem } from '../types';

// モックデータ
const MOCK_BUDGET_ITEMS: BudgetItem[] = [
  {
    id: '1',
    tripId: '1',
    category: 'transport',
    name: '新幹線（往復）',
    amount: 27000,
  },
  {
    id: '2',
    tripId: '1',
    category: 'accommodation',
    name: 'ホテル 2泊',
    amount: 24000,
    memo: '朝食付き',
  },
  {
    id: '3',
    tripId: '1',
    category: 'food',
    name: '昼食・夕食',
    amount: 15000,
  },
  {
    id: '4',
    tripId: '1',
    category: 'activity',
    name: '寺社拝観料',
    amount: 3000,
  },
  {
    id: '5',
    tripId: '1',
    category: 'other',
    name: 'お土産',
    amount: 5000,
  },
];

const CATEGORY_COLORS: Record<BudgetItem['category'], string> = {
  transport: '#3B82F6',
  accommodation: '#8B5CF6',
  food: '#F59E0B',
  activity: '#10B981',
  other: '#6B7280',
};

type Props = TripTabScreenProps<'Budget'>;

export function BudgetScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [items] = useState<BudgetItem[]>(MOCK_BUDGET_ITEMS);
  const memberCount = 2; // TODO: 旅行情報から取得

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const perPersonAmount = Math.ceil(totalAmount / memberCount);

  // カテゴリ別の集計
  const categoryTotals = items.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleItemPress = (item: BudgetItem) => {
    Alert.alert(item.name, `金額: ¥${item.amount.toLocaleString()}\n${item.memo || ''}`, [
      { text: '編集', onPress: () => console.log('Edit', item.id) },
      { text: '削除', style: 'destructive', onPress: () => console.log('Delete', item.id) },
      { text: '閉じる', style: 'cancel' },
    ]);
  };

  const handleAddItem = () => {
    navigation.navigate('AddBudgetItem', { tripId });
  };

  const renderHeader = () => (
    <View>
      {/* サマリーカード */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>合計</Text>
            <Text style={styles.summaryAmount}>¥{totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>1人あたり</Text>
            <Text style={styles.summaryAmountSmall}>¥{perPersonAmount.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* カテゴリ別内訳 */}
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>カテゴリ別内訳</Text>
        <View style={styles.breakdownChart}>
          {Object.entries(categoryTotals).map(([category, amount]) => {
            const percentage = (amount / totalAmount) * 100;
            return (
              <View
                key={category}
                style={[
                  styles.breakdownBar,
                  {
                    width: `${percentage}%`,
                    backgroundColor: CATEGORY_COLORS[category as BudgetItem['category']],
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.breakdownLegend}>
          {Object.entries(categoryTotals).map(([category, amount]) => (
            <View key={category} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: CATEGORY_COLORS[category as BudgetItem['category']] },
                ]}
              />
              <Text style={styles.legendAmount}>¥{amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>支出一覧</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BudgetItemCard item={item} onPress={() => handleItemPress(item)} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>
              支出項目がありません{'\n'}+ ボタンから追加しましょう
            </Text>
          </View>
        )}
      />

      <FAB onPress={handleAddItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#3B82F6',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  summaryAmountSmall: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  breakdownCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  breakdownChart: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  breakdownBar: {
    height: '100%',
  },
  breakdownLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendAmount: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
