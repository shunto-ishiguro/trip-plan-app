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
import { GradientButton } from '../components';
import type { RootStackScreenProps } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import type { BudgetItem } from '../types';

type Props = RootStackScreenProps<'AddBudgetItem'>;

const CATEGORIES: {
  value: BudgetItem['category'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { value: 'transport', label: '交通費', icon: 'car-outline', color: colors.category.transport },
  {
    value: 'accommodation',
    label: '宿泊費',
    icon: 'bed-outline',
    color: colors.category.accommodation,
  },
  { value: 'food', label: '食費', icon: 'restaurant-outline', color: colors.category.food },
  {
    value: 'activity',
    label: 'アクティビティ',
    icon: 'ticket-outline',
    color: colors.category.activity,
  },
  {
    value: 'other',
    label: 'その他',
    icon: 'ellipsis-horizontal-outline',
    color: colors.category.other,
  },
];

export function AddBudgetItemScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [category, setCategory] = useState<BudgetItem['category']>('other');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [pricingType, setPricingType] = useState<BudgetItem['pricingType']>('total');
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
      pricingType,
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
              placeholderTextColor={colors.text.quaternary}
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
                placeholderTextColor={colors.text.quaternary}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>金額の種別</Text>
            <View style={styles.pricingTypeRow}>
              <TouchableOpacity
                style={[
                  styles.pricingTypeButton,
                  pricingType === 'total' && styles.pricingTypeButtonActive,
                ]}
                onPress={() => setPricingType('total')}
              >
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={pricingType === 'total' ? colors.white : colors.text.tertiary}
                />
                <Text
                  style={[
                    styles.pricingTypeLabel,
                    pricingType === 'total' && styles.pricingTypeLabelActive,
                  ]}
                >
                  全体の金額
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pricingTypeButton,
                  pricingType === 'per_person' && styles.pricingTypeButtonActive,
                ]}
                onPress={() => setPricingType('per_person')}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={pricingType === 'per_person' ? colors.white : colors.text.tertiary}
                />
                <Text
                  style={[
                    styles.pricingTypeLabel,
                    pricingType === 'per_person' && styles.pricingTypeLabelActive,
                  ]}
                >
                  1人あたり
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={memo}
              onChangeText={setMemo}
              placeholder="メモ..."
              placeholderTextColor={colors.text.quaternary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton onPress={handleSave} label="追加する" />
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    gap: spacing.md,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
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
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  pricingTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pricingTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.border.primary,
    borderRadius: radius.lg,
    paddingVertical: 12,
  },
  pricingTypeButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pricingTypeLabel: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  pricingTypeLabelActive: {
    color: colors.white,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
});
