import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
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
import * as tripsApi from '../api/trips';
import { FormInput, GradientButton } from '../components';
import type { RootStackScreenProps } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { formatDateISO, parseDate } from '../utils/date';

type Props = RootStackScreenProps<'TripCreate'> | RootStackScreenProps<'TripEdit'>;

export function TripCreateScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const isEdit = route.name === 'TripEdit';
  const tripId = isEdit ? (route.params as { tripId: string }).tripId : null;

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [memberCount, setMemberCount] = useState('2');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !tripId) return;
    (async () => {
      try {
        const trip = await tripsApi.getTrip(tripId);
        setTitle(trip.title);
        setDestination(trip.destination);
        setStartDate(parseDate(trip.startDate));
        setEndDate(parseDate(trip.endDate));
        setMemberCount(String(trip.memberCount));
        setMemo(trip.memo ?? '');
      } catch {
        Alert.alert('エラー', '旅行情報の取得に失敗しました');
      }
    })();
  }, [isEdit, tripId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', '旅行タイトルを入力してください');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('エラー', '行き先を入力してください');
      return;
    }

    setSaving(true);
    try {
      const body = {
        title,
        destination,
        startDate: startDate ? formatDateISO(startDate) : '',
        endDate: endDate ? formatDateISO(endDate) : '',
        memberCount: Number.parseInt(memberCount, 10) || 1,
        memo: memo || null,
      };

      if (isEdit && tripId) {
        await tripsApi.updateTrip(tripId, body);
      } else {
        await tripsApi.createTrip(body);
      }
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
          <FormInput
            label="旅行タイトル *"
            value={title}
            onChangeText={setTitle}
            placeholder="例: 京都旅行"
          />

          <FormInput
            label="行き先 *"
            value={destination}
            onChangeText={setDestination}
            placeholder="例: 京都府"
          />

          <View style={styles.row}>
            <View style={[styles.section, styles.halfSection]}>
              <Text style={styles.label}>開始日</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowStartDatePicker(true)}>
                <Text style={startDate ? styles.inputText : styles.placeholderText}>
                  {startDate ? formatDateISO(startDate) : 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate ?? new Date()}
                  mode="date"
                  onChange={(_, selected) => {
                    setShowStartDatePicker(Platform.OS === 'ios');
                    if (selected) setStartDate(selected);
                  }}
                />
              )}
            </View>
            <View style={[styles.section, styles.halfSection]}>
              <Text style={styles.label}>終了日</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowEndDatePicker(true)}>
                <Text style={endDate ? styles.inputText : styles.placeholderText}>
                  {endDate ? formatDateISO(endDate) : 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate ?? new Date()}
                  mode="date"
                  onChange={(_, selected) => {
                    setShowEndDatePicker(Platform.OS === 'ios');
                    if (selected) setEndDate(selected);
                  }}
                />
              )}
            </View>
          </View>

          <FormInput
            label="人数"
            value={memberCount}
            onChangeText={setMemberCount}
            keyboardType="number-pad"
            placeholder="2"
          />

          <FormInput
            label="メモ"
            value={memo}
            onChangeText={setMemo}
            placeholder="旅行に関するメモ..."
            multiline
            numberOfLines={4}
          />
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton
            onPress={handleSave}
            label={saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
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
  inputText: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.primary,
  },
  placeholderText: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.quaternary,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
});
