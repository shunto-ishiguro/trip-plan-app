import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../navigation/types';
import type { BudgetItem } from '../types';

type Props = RootStackScreenProps<'AddBudgetItem'>;

const CATEGORIES: {
  value: BudgetItem['category'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { value: 'transport', label: '交通費', icon: 'car-outline', color: '#3B82F6' },
  { value: 'accommodation', label: '宿泊費', icon: 'bed-outline', color: '#8B5CF6' },
  { value: 'food', label: '食費', icon: 'restaurant-outline', color: '#F59E0B' },
  { value: 'activity', label: 'アクティビティ', icon: 'ticket-outline', color: '#10B981' },
  { value: 'other', label: 'その他', icon: 'ellipsis-horizontal-outline', color: '#6B7280' },
];

export function AddBudgetItemScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [category, setCategory] = useState<BudgetItem['category']>('other');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('エラー', '項目名を入力してください');
      return;
    }
    if (!amount.trim() || Number.isNaN(Number(amount))) {
      Alert.alert('エラー', '金額を正しく入力してください');
      return;
    }

    // TODO: API呼び出し
    console.log({
      tripId,
      category,
      name,
      amount: parseInt(amount, 10),
      memo,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>カテゴリ *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryItem,
                    category === cat.value && {
                      borderColor: cat.color,
                      backgroundColor: `${cat.color}10`,
                    },
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                    <Ionicons name={cat.icon} size={20} color="#fff" />
                  </View>
                  <Text
                    style={[styles.categoryLabel, category === cat.value && { color: cat.color }]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>項目名 *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="例: 新幹線（往復）"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>金額 *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>¥</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={memo}
              onChangeText={setMemo}
              placeholder="メモ..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>追加する</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
