import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import * as budgetItemsApi from '../api/budgetItems';
import { BudgetItemCard, EmptyState, FAB } from '../components';
import { useTrip } from '../contexts/TripContext';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import type { TripTabScreenProps } from '../navigation/types';
import { colors, gradients, radius, shadows, spacing, typography } from '../theme';
import type { BudgetItem } from '../types';

type Props = TripTabScreenProps<'Budget'>;

export function BudgetScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const { trip } = useTrip();
  const memberCount = trip?.memberCount ?? 1;

  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const budgetData = await budgetItemsApi.getBudgetItems(tripId);
      setItems(budgetData);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const getItemTotal = (item: BudgetItem) =>
    item.pricingType === 'per_person' ? item.amount * memberCount : item.amount;

  const totalAmount = items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const perPersonAmount = memberCount > 0 ? Math.ceil(totalAmount / memberCount) : 0;

  const categoryTotals = items.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + getItemTotal(item);
      return acc;
    },
    {} as Record<string, number>,
  );

  const { confirmDelete } = useDeleteConfirmation<BudgetItem>(
    (id) => budgetItemsApi.deleteBudgetItem(tripId, id),
    setItems,
  );

  const handleItemPress = (item: BudgetItem) => {
    confirmDelete(item, item.name, `金額: ¥${item.amount.toLocaleString()}\n${item.memo || ''}`);
  };

  const handleAddItem = () => {
    navigation.navigate('AddBudgetItem', { tripId });
  };

  const renderHeader = () => (
    <View>
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

      {totalAmount > 0 && (
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
      )}

      <Text style={styles.sectionTitle}>支出一覧</Text>
      {items.length > 0 && <Text style={styles.hintText}>タップで詳細・削除</Text>}
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
          <EmptyState
            icon="wallet-outline"
            message={`支出項目がありません\n+ ボタンから追加しましょう`}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: colors.whiteAlpha30,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.md,
    color: colors.whiteAlpha80,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: typography.fontSizes['5xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  summaryAmountSmall: {
    fontSize: 22,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
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
  hintText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.quaternary,
    textAlign: 'center',
    paddingBottom: spacing.md,
  },
});
