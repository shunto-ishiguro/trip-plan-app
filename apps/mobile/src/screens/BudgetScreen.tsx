import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { BudgetItemCard, FAB } from '../components';
import type { TripTabScreenProps } from '../navigation/types';
import { colors, gradients, radius, shadows, spacing, typography } from '../theme';
import type { BudgetItem } from '../types';

// モックデータ
const MOCK_BUDGET_ITEMS: BudgetItem[] = [
  {
    id: '1',
    tripId: '1',
    category: 'transport',
    name: '新幹線（往復）',
    amount: 27000,
    pricingType: 'per_person',
  },
  {
    id: '2',
    tripId: '1',
    category: 'accommodation',
    name: 'ホテル 2泊',
    amount: 24000,
    pricingType: 'total',
    memo: '朝食付き',
  },
  {
    id: '3',
    tripId: '1',
    category: 'food',
    name: '昼食・夕食',
    amount: 15000,
    pricingType: 'total',
  },
  {
    id: '4',
    tripId: '1',
    category: 'activity',
    name: '寺社拝観料',
    amount: 3000,
    pricingType: 'per_person',
  },
  {
    id: '5',
    tripId: '1',
    category: 'other',
    name: 'お土産',
    amount: 5000,
    pricingType: 'per_person',
  },
];

type Props = TripTabScreenProps<'Budget'>;

export function BudgetScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [items] = useState<BudgetItem[]>(MOCK_BUDGET_ITEMS);
  const memberCount = 2; // TODO: 旅行情報から取得

  // pricingType に応じて全体金額を計算
  const getItemTotal = (item: BudgetItem) =>
    item.pricingType === 'per_person' ? item.amount * memberCount : item.amount;

  const totalAmount = items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const perPersonAmount = Math.ceil(totalAmount / memberCount);

  // カテゴリ別の集計
  const categoryTotals = items.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + getItemTotal(item);
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
      <LinearGradient
        colors={[...gradients.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryCard}
      >
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
      </LinearGradient>

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
                    backgroundColor: colors.category[category as BudgetItem['category']],
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
                  { backgroundColor: colors.category[category as BudgetItem['category']] },
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
          <BudgetItemCard
            item={item}
            memberCount={memberCount}
            onPress={() => handleItemPress(item)}
          />
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
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingBottom: 100,
  },
  summaryCard: {
    margin: spacing.lg,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    ...shadows.lg,
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
    fontSize: typography.fontSizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: typography.fontSizes['5xl'],
    fontWeight: typography.fontWeights.bold,
    color: '#fff',
  },
  summaryAmountSmall: {
    fontSize: 22,
    fontWeight: typography.fontWeights.semibold,
    color: '#fff',
  },
  breakdownCard: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  breakdownTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.base,
  },
  breakdownChart: {
    flexDirection: 'row',
    height: 12,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  breakdownBar: {
    height: '100%',
  },
  breakdownLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendAmount: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
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
