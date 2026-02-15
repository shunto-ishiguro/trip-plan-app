import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import * as reservationsApi from '../api/reservations';
import { FormInput, GradientButton } from '../components';
import type { RootStackScreenProps } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import type { Reservation } from '../types';
import { formatDateISO, formatTime } from '../utils/date';

type Props = RootStackScreenProps<'AddReservation'>;

const RESERVATION_TYPES: {
  value: Reservation['type'];
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { value: 'flight', label: '航空券', icon: 'airplane-outline', color: colors.reservation.flight },
  { value: 'hotel', label: 'ホテル', icon: 'bed-outline', color: colors.reservation.hotel },
  {
    value: 'rental_car',
    label: 'レンタカー',
    icon: 'car-outline',
    color: colors.reservation.rental_car,
  },
  {
    value: 'restaurant',
    label: 'レストラン',
    icon: 'restaurant-outline',
    color: colors.reservation.restaurant,
  },
  {
    value: 'activity',
    label: 'アクティビティ',
    icon: 'ticket-outline',
    color: colors.reservation.activity,
  },
  {
    value: 'other',
    label: 'その他',
    icon: 'document-text-outline',
    color: colors.reservation.other,
  },
];

export function AddReservationScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId } = route.params;

  const [type, setType] = useState<Reservation['type']>('hotel');
  const [name, setName] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [link, setLink] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', '予約名を入力してください');
      return;
    }

    const dateStr = date ? formatDateISO(date) : '';
    const timeStr = time ? formatTime(time) : '';
    const datetime =
      dateStr && timeStr ? `${dateStr}T${timeStr}:00` : dateStr ? `${dateStr}T00:00:00` : undefined;

    setSaving(true);
    try {
      await reservationsApi.createReservation(tripId, {
        type,
        name,
        confirmationNumber: confirmationNumber || null,
        datetime: datetime || null,
        link: link || null,
        memo: memo || null,
      });
      navigation.goBack();
    } catch {
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const selectedType = RESERVATION_TYPES.find((t) => t.value === type);

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
            <Text style={styles.label}>予約タイプ *</Text>
            <View style={styles.typeGrid}>
              {RESERVATION_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.typeItem,
                    type === item.value && {
                      borderColor: item.color,
                      backgroundColor: `${item.color}10`,
                    },
                  ]}
                  onPress={() => setType(item.value)}
                >
                  <View style={[styles.typeIcon, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={20} color={colors.white} />
                  </View>
                  <Text style={[styles.typeLabel, type === item.value && { color: item.color }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <FormInput
            label="予約名 *"
            value={name}
            onChangeText={setName}
            placeholder={`例: ${selectedType?.label || '予約'}の名前`}
          />

          <FormInput
            label="予約番号・確認番号"
            value={confirmationNumber}
            onChangeText={setConfirmationNumber}
            placeholder="例: ABC123XYZ"
            autoCapitalize="characters"
          />

          <View style={styles.row}>
            <View style={[styles.section, styles.flex2]}>
              <Text style={styles.label}>日付</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={date ? styles.inputText : styles.placeholderText}>
                  {date ? formatDateISO(date) : 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date ?? new Date()}
                  mode="date"
                  onChange={(_, selected) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selected) setDate(selected);
                  }}
                />
              )}
            </View>
            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.label}>時間</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
                <Text style={time ? styles.inputText : styles.placeholderText}>
                  {time ? formatTime(time) : 'HH:MM'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time ?? new Date()}
                  mode="time"
                  onChange={(_, selected) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (selected) setTime(selected);
                  }}
                />
              )}
            </View>
          </View>

          <FormInput
            label="リンク"
            value={link}
            onChangeText={setLink}
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
          />

          <FormInput
            label="メモ"
            value={memo}
            onChangeText={setMemo}
            placeholder="予約に関するメモ..."
            multiline
            numberOfLines={3}
          />
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
  section: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  label: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeItem: {
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
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: {
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
