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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '../components';
import type { RootStackScreenProps } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = RootStackScreenProps<'TripCreate'> | RootStackScreenProps<'TripEdit'>;

export function TripCreateScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const isEdit = route.name === 'TripEdit';
  const _tripId = isEdit ? (route.params as { tripId: string }).tripId : null;

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memberCount, setMemberCount] = useState('2');
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('エラー', '旅行タイトルを入力してください');
      return;
    }

    // TODO: API呼び出し
    console.log({
      title,
      startDate,
      endDate,
      memberCount: parseInt(memberCount, 10),
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
            <Text style={styles.label}>旅行タイトル *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="例: 京都旅行"
              placeholderTextColor={colors.text.quaternary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfSection]}>
              <Text style={styles.label}>開始日</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.quaternary}
              />
            </View>
            <View style={[styles.section, styles.halfSection]}>
              <Text style={styles.label}>終了日</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.quaternary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>人数</Text>
            <TextInput
              style={styles.input}
              value={memberCount}
              onChangeText={setMemberCount}
              keyboardType="number-pad"
              placeholder="2"
              placeholderTextColor={colors.text.quaternary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={memo}
              onChangeText={setMemo}
              placeholder="旅行に関するメモ..."
              placeholderTextColor={colors.text.quaternary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton onPress={handleSave} label={isEdit ? '更新する' : '作成する'} />
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
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  halfSection: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
});
