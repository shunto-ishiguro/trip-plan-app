import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
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
import * as spotsApi from '../api/spots';
import { FormInput, GradientButton } from '../components';
import type { RootStackScreenProps } from '../navigation/types';
import { colors, gradients, radius, spacing, typography } from '../theme';
import { formatTime } from '../utils/date';

type Props = RootStackScreenProps<'AddSpot'>;

export function AddSpotScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId, dayIndex } = route.params;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', 'スポット名を入力してください');
      return;
    }

    setSaving(true);
    try {
      await spotsApi.createSpot(tripId, {
        dayIndex,
        order: 0,
        name,
        address: address || null,
        startTime: startTime ? formatTime(startTime) : null,
        endTime: endTime ? formatTime(endTime) : null,
        memo: memo || null,
      });
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
          <LinearGradient
            colors={[gradients.primary[0], gradients.primary[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dayBadge}
          >
            <Text style={styles.dayBadgeText}>Day {dayIndex + 1}</Text>
          </LinearGradient>

          <FormInput
            label="スポット名 *"
            value={name}
            onChangeText={setName}
            placeholder="例: 清水寺"
          />

          <FormInput
            label="住所"
            value={address}
            onChangeText={setAddress}
            placeholder="例: 京都府京都市東山区清水1丁目294"
          />

          <View style={styles.row}>
            <View style={[styles.section, styles.halfSection]}>
              <Text style={styles.label}>開始時間</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowStartTimePicker(true)}>
                <Text style={startTime ? styles.inputText : styles.placeholderText}>
                  {startTime ? formatTime(startTime) : 'HH:MM'}
                </Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime ?? new Date()}
                  mode="time"
                  onChange={(_, selected) => {
                    setShowStartTimePicker(Platform.OS === 'ios');
                    if (selected) setStartTime(selected);
                  }}
                />
              )}
            </View>
            <View style={[styles.section, styles.halfSection]}>
              <Text style={styles.label}>終了時間</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowEndTimePicker(true)}>
                <Text style={endTime ? styles.inputText : styles.placeholderText}>
                  {endTime ? formatTime(endTime) : 'HH:MM'}
                </Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime ?? new Date()}
                  mode="time"
                  onChange={(_, selected) => {
                    setShowEndTimePicker(Platform.OS === 'ios');
                    if (selected) setEndTime(selected);
                  }}
                />
              )}
            </View>
          </View>

          <FormInput
            label="メモ"
            value={memo}
            onChangeText={setMemo}
            placeholder="スポットに関するメモ..."
            multiline
            numberOfLines={4}
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
  dayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius['2xl'],
    marginBottom: spacing.xl,
  },
  dayBadgeText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
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
