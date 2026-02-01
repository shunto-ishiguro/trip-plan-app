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

type Props = RootStackScreenProps<'AddChecklistItem'>;

const QUICK_ITEMS = {
  packing: [
    'パスポート',
    '財布・現金',
    'スマホ・充電器',
    '着替え',
    '洗面用具',
    '薬・常備薬',
    'カメラ',
    'モバイルバッテリー',
    '折りたたみ傘',
    'ガイドブック',
  ],
  todo: [
    '航空券の予約',
    'ホテルの予約',
    'レンタカーの予約',
    '旅行保険の加入',
    '両替',
    '郵便物の転送手続き',
    '植物の水やり依頼',
    'ペットの預け先確認',
    '空港までのルート確認',
    '必要書類の準備',
  ],
};

export function AddChecklistItemScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId, type } = route.params;

  const [text, setText] = useState('');
  const [selectedQuickItems, setSelectedQuickItems] = useState<string[]>([]);

  const isPackingList = type === 'packing';
  const title = isPackingList ? '持ち物' : 'やること';
  const quickItems = QUICK_ITEMS[type];

  const toggleQuickItem = (item: string) => {
    setSelectedQuickItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const handleSave = () => {
    const items = [...selectedQuickItems];
    if (text.trim()) {
      items.push(text.trim());
    }

    if (items.length === 0) {
      Alert.alert('エラー', `${title}を入力または選択してください`);
      return;
    }

    // TODO: API呼び出し
    console.log({
      tripId,
      type,
      items,
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
          <View style={styles.typeIndicator}>
            <Ionicons
              name={isPackingList ? 'bag-outline' : 'checkbox-outline'}
              size={20}
              color="#3B82F6"
            />
            <Text style={styles.typeIndicatorText}>
              {isPackingList ? '持ち物リスト' : 'やることリスト'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{title}を入力</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={`例: ${isPackingList ? 'パスポート' : '航空券の予約'}`}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>よく使う{title}</Text>
            <Text style={styles.hint}>タップして選択（複数可）</Text>
            <View style={styles.quickItemsGrid}>
              {quickItems.map((item) => {
                const isSelected = selectedQuickItems.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.quickItem, isSelected && styles.quickItemSelected]}
                    onPress={() => toggleQuickItem(item)}
                  >
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />}
                    <Text
                      style={[styles.quickItemText, isSelected && styles.quickItemTextSelected]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedQuickItems.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={styles.selectedTitle}>選択中: {selectedQuickItems.length}件</Text>
            </View>
          )}
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
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
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
  quickItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickItemText: {
    fontSize: 14,
    color: '#374151',
  },
  quickItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  selectedSection: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
