import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, gradients, radius, shadows, spacing, typography } from '../theme';
import type { BudgetItem } from '../types';

interface BudgetItemCardProps {
  item: BudgetItem;
  memberCount: number;
  onPress: () => void;
}

const CATEGORY_LABELS: Record<BudgetItem['category'], string> = {
  transport: '交通費',
  accommodation: '宿泊',
  food: '食事',
  activity: 'アクティビティ',
  other: 'その他',
};

export function BudgetItemCard({ item, memberCount, onPress }: BudgetItemCardProps) {
  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const badgeGradient = gradients[item.category];
  const isPerPerson = item.pricingType === 'per_person';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <LinearGradient
          colors={[...badgeGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.categoryBadge}
        >
          <Text style={styles.categoryText}>{CATEGORY_LABELS[item.category]}</Text>
        </LinearGradient>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.memo && (
            <Text style={styles.memo} numberOfLines={1}>
              {item.memo}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
        <Text style={styles.pricingLabel}>{isPerPerson ? '/ 1人' : `/ ${memberCount}人`}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    padding: 14,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xl,
    marginRight: spacing.base,
  },
  categoryText: {
    color: '#fff',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  memo: {
    fontSize: typography.fontSizes.md,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  amount: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  pricingLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
