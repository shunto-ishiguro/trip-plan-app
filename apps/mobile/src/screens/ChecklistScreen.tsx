import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as checklistApi from '../api/checklistItems';
import { ChecklistItemRow, EmptyState, FAB } from '../components';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import type { TripTabScreenProps } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import type { ChecklistItem } from '../types';

type Props = TripTabScreenProps<'Checklist'>;
type TabType = 'packing' | 'todo';

export function ChecklistScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [selectedTab, setSelectedTab] = useState<TabType>('packing');
  const [packingItems, setPackingItems] = useState<ChecklistItem[]>([]);
  const [todoItems, setTodoItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const data = await checklistApi.getChecklistItems(tripId);
      setPackingItems(data.filter((i) => i.type === 'packing'));
      setTodoItems(data.filter((i) => i.type === 'todo'));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems]),
  );

  const items = selectedTab === 'packing' ? packingItems : todoItems;
  const setItems = selectedTab === 'packing' ? setPackingItems : setTodoItems;

  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handleToggle = async (id: string) => {
    const prev = items;
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
    try {
      await checklistApi.toggleChecklistItem(tripId, id);
    } catch {
      setItems(prev);
      Alert.alert('エラー', '更新に失敗しました');
    }
  };

  const { confirmDelete } = useDeleteConfirmation<ChecklistItem>(
    (id) => checklistApi.deleteChecklistItem(tripId, id),
    setItems,
  );

  const handleLongPress = (item: ChecklistItem) => {
    confirmDelete(item, item.text);
  };

  const handleAddItem = () => {
    navigation.navigate('AddChecklistItem', { tripId, type: selectedTab });
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

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
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'packing' && styles.tabActive]}
          onPress={() => setSelectedTab('packing')}
        >
          <Text style={[styles.tabText, selectedTab === 'packing' && styles.tabTextActive]}>
            持ち物リスト
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'todo' && styles.tabActive]}
          onPress={() => setSelectedTab('todo')}
        >
          <Text style={[styles.tabText, selectedTab === 'todo' && styles.tabTextActive]}>
            やることリスト
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {checkedCount} / {totalCount} 完了
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {items.length > 0 && <Text style={styles.hintText}>長押しで削除できます</Text>}

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChecklistItemRow
            item={item}
            onToggle={() => handleToggle(item.id)}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <EmptyState
            icon={selectedTab === 'packing' ? 'bag-outline' : 'document-text-outline'}
            message={`${selectedTab === 'packing' ? '持ち物' : 'やること'}がありません\n+ ボタンから追加しましょう`}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.accent,
  },
  progressContainer: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressText: {
    fontSize: typography.fontSizes.base,
    color: colors.text.secondary,
  },
  progressPercent: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.accent,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border.primary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
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
});
