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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '../components';
import type { RootStackScreenProps } from '../navigation/types';
import { colors, gradients, radius, spacing, typography } from '../theme';

type Props = RootStackScreenProps<'AddSpot'>;

export function AddSpotScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { tripId, dayIndex } = route.params;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [memo, setMemo] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('エラー', 'スポット名を入力してください');
      return;
    }

    // TODO: API呼び出し
    console.log({
      tripId,
      dayIndex,
      name,
      address,
      startTime,
      endTime,
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
          <LinearGradient
            colors={[gradients.primary[0], gradients.primary[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dayBadge}
          >
            <Text style={styles.dayBadgeText}>Day {dayIndex + 1}</Text>
          </LinearGradient>

          <View style={styles.section}>
            <Text style={styles.label}>スポット名 *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="例: 清水寺"
              placeholderTextColor={colors.text.quaternary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>住所</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="例: 京都府京都市東山区清水1丁目294"
              placeholderTextColor={colors.text.quaternary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfSection]}>
              <Text style={styles.label}>開始時間</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.text.quaternary}
              />
            </View>
            <View style={[styles.section, styles.halfSection]}>
              <Text style={styles.label}>終了時間</Text>
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.text.quaternary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>メモ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={memo}
              onChangeText={setMemo}
              placeholder="スポットに関するメモ..."
              placeholderTextColor={colors.text.quaternary}
              multiline
              numberOfLines={4}
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
  dayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius['2xl'],
    marginBottom: spacing.xl,
  },
  dayBadgeText: {
    color: '#fff',
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
