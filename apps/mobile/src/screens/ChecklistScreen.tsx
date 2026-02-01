import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChecklistItemRow, FAB } from '../components';
import type { TripTabScreenProps } from '../navigation/types';
import type { ChecklistItem } from '../types';

// モックデータ
const MOCK_PACKING_ITEMS: ChecklistItem[] = [
  { id: '1', tripId: '1', type: 'packing', text: 'パスポート', checked: true },
  { id: '2', tripId: '1', type: 'packing', text: '財布・現金', checked: true },
  { id: '3', tripId: '1', type: 'packing', text: 'スマホ・充電器', checked: false },
  { id: '4', tripId: '1', type: 'packing', text: '着替え（3日分）', checked: false },
  { id: '5', tripId: '1', type: 'packing', text: '洗面用具', checked: false },
  { id: '6', tripId: '1', type: 'packing', text: 'カメラ', checked: false },
];

const MOCK_TODO_ITEMS: ChecklistItem[] = [
  { id: '7', tripId: '1', type: 'todo', text: '新幹線のチケット予約', checked: true },
  { id: '8', tripId: '1', type: 'todo', text: 'ホテルの予約確認', checked: true },
  { id: '9', tripId: '1', type: 'todo', text: '郵便物の転送手続き', checked: false },
  { id: '10', tripId: '1', type: 'todo', text: '植物の水やり依頼', checked: false },
];

type Props = TripTabScreenProps<'Checklist'>;
type TabType = 'packing' | 'todo';

export function ChecklistScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [selectedTab, setSelectedTab] = useState<TabType>('packing');
  const [packingItems, setPackingItems] = useState(MOCK_PACKING_ITEMS);
  const [todoItems, setTodoItems] = useState(MOCK_TODO_ITEMS);

  const items = selectedTab === 'packing' ? packingItems : todoItems;
  const setItems = selectedTab === 'packing' ? setPackingItems : setTodoItems;

  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const handleItemPress = (item: ChecklistItem) => {
    Alert.alert(item.text, '操作を選択', [
      { text: '編集', onPress: () => console.log('Edit', item.id) },
      { text: '削除', style: 'destructive', onPress: () => console.log('Delete', item.id) },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  };

  const handleAddItem = () => {
    navigation.navigate('AddChecklistItem', { tripId, type: selectedTab });
  };

  // 完了したアイテムを下に並べる
  const sortedItems = [...items].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  return (
    <View style={styles.container}>
      {/* タブ */}
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

      {/* 進捗表示 */}
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

      {/* リスト */}
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChecklistItemRow
            item={item}
            onToggle={() => handleToggle(item.id)}
            onPress={() => handleItemPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{selectedTab === 'packing' ? '🎒' : '📝'}</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'packing' ? '持ち物' : 'やること'}がありません{'\n'}+
              ボタンから追加しましょう
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
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
