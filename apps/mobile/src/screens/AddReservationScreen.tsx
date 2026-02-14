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
import type { Reservation } from '../types';

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
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [link, setLink] = useState('');
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('エラー', '予約名を入力してください');
      return;
    }

    const datetime = date && time ? `${date}T${time}:00` : date ? `${date}T00:00:00` : undefined;

    // TODO: API呼び出し
    console.log({
      tripId,
      type,
      name,
      confirmationNumber: confirmationNumber || undefined,
      datetime,
      link: link || undefined,
      memo: memo || undefined,
    });

    navigation.goBack();
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
                    <Ionicons name={item.icon} size={20} color="#fff" />
                  </View>
                  <Text style={[styles.typeLabel, type === item.value && { color: item.color }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>予約名 *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={`例: ${selectedType?.label || '予約'}の名前`}
              placeholderTextColor={colors.text.quaternary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>予約番号・確認番号</Text>
            <TextInput
              style={styles.input}
              value={confirmationNumber}
              onChangeText={setConfirmationNumber}
              placeholder="例: ABC123XYZ"
              placeholderTextColor={colors.text.quaternary}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.flex2]}>
              <Text style={styles.label}>日付</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.quaternary}
              />
            </View>
            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.label}>時間</Text>
              <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.text.quaternary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>リンク</Text>
            <TextInput
              style={styles.input}
              value={link}
              onChangeText={setLink}
              placeholder="https://..."
              placeholderTextColor={colors.text.quaternary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={memo}
              onChangeText={setMemo}
              placeholder="予約に関するメモ..."
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
