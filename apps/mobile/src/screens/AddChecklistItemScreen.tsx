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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as checklistApi from '../api/checklistItems';
import { FormInput, GradientButton } from '../components';
import type { RootStackScreenProps } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

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
  const [saving, setSaving] = useState(false);

  const isPackingList = type === 'packing';
  const title = isPackingList ? '持ち物' : 'やること';
  const quickItems = QUICK_ITEMS[type];

  const toggleQuickItem = (item: string) => {
    setSelectedQuickItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const handleSave = async () => {
    const itemTexts = [...selectedQuickItems];
    if (text.trim()) {
      itemTexts.push(text.trim());
    }

    if (itemTexts.length === 0) {
      Alert.alert('エラー', `${title}を入力または選択してください`);
      return;
    }

    setSaving(true);
    try {
      await checklistApi.batchCreateChecklistItems(
        tripId,
        itemTexts.map((t) => ({ type, text: t })),
      );
      navigation.goBack();
    } catch {
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setSaving(false);
    }
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
              color={colors.accent}
            />
            <Text style={styles.typeIndicatorText}>
              {isPackingList ? '持ち物リスト' : 'やることリスト'}
            </Text>
          </View>

          <FormInput
            label={`${title}を入力`}
            value={text}
            onChangeText={setText}
            placeholder={`例: ${isPackingList ? 'パスポート' : '航空券の予約'}`}
          />

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
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                    )}
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
          <GradientButton
            onPress={handleSave}
            label={saving ? '保存中...' : '追加する'}
            disabled={saving}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['5xl'],
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  typeIndicatorText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.accent,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  label: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.quaternary,
    marginBottom: spacing.base,
  },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.fontSizes.xl,
    color: colors.text.primary,
  },
  quickItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radius['3xl'],
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
  },
  quickItemSelected: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  quickItemText: {
    fontSize: typography.fontSizes.base,
    color: colors.text.secondary,
  },
  quickItemTextSelected: {
    color: colors.accent,
    fontWeight: typography.fontWeights.medium,
  },
  selectedSection: {
    backgroundColor: colors.background.elevated,
    padding: spacing.base,
    borderRadius: radius.md,
  },
  selectedTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
});
