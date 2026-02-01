import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BudgetItem } from '../types';

interface BudgetItemCardProps {
  item: BudgetItem;
  onPress: () => void;
}

const CATEGORY_LABELS: Record<BudgetItem['category'], string> = {
  transport: '交通費',
  accommodation: '宿泊',
  food: '食事',
  activity: 'アクティビティ',
  other: 'その他',
};

const CATEGORY_COLORS: Record<BudgetItem['category'], string> = {
  transport: '#3B82F6',
  accommodation: '#8B5CF6',
  food: '#F59E0B',
  activity: '#10B981',
  other: '#6B7280',
};

export function BudgetItemCard({ item, onPress }: BudgetItemCardProps) {
  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] }]}>
          <Text style={styles.categoryText}>{CATEGORY_LABELS[item.category]}</Text>
        </View>
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
      <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  memo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
});
