import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as sharesApi from '../api/shares';
import { GradientButton } from '../components/GradientButton';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import type { TripPreview } from '../types';
import { formatDateDisplay } from '../utils/date';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function JoinTripScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [passphrase, setPassphrase] = useState('');
  const [preview, setPreview] = useState<TripPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleSearch = async () => {
    const trimmed = passphrase.trim();
    if (trimmed.length !== 6) {
      Alert.alert('入力エラー', '合言葉は6文字で入力してください');
      return;
    }
    setLoading(true);
    try {
      const data = await sharesApi.previewTrip(trimmed);
      setPreview(data);
    } catch {
      Alert.alert('見つかりません', 'この合言葉に一致する旅行が見つかりませんでした');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const result = await sharesApi.joinTrip(passphrase.trim());
      navigation.replace('TripDetail', {
        tripId: result.tripId,
        tripTitle: preview?.title,
        screen: 'Schedule',
        params: { tripId: result.tripId },
      });
    } catch {
      Alert.alert('エラー', '旅行への参加に失敗しました');
    } finally {
      setJoining(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {!preview ? (
          <>
            <Text style={styles.heading}>合言葉を入力</Text>
            <Text style={styles.description}>共有された6文字の合言葉を入力してください</Text>

            <TextInput
              style={styles.input}
              value={passphrase}
              onChangeText={setPassphrase}
              autoCapitalize="characters"
              maxLength={6}
              placeholder="例: ABC3DE"
              placeholderTextColor={colors.text.quaternary}
              autoCorrect={false}
              autoFocus
            />

            <GradientButton
              onPress={handleSearch}
              label={loading ? '検索中...' : '検索する'}
              disabled={loading || passphrase.trim().length !== 6}
            />

            {loading && (
              <ActivityIndicator size="small" color={colors.accent} style={styles.spinner} />
            )}
          </>
        ) : (
          <>
            <Text style={styles.heading}>旅行が見つかりました</Text>

            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>{preview.title}</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>行き先</Text>
                <Text style={styles.previewValue}>{preview.destination}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>日程</Text>
                <Text style={styles.previewValue}>
                  {formatDateDisplay(preview.startDate)} - {formatDateDisplay(preview.endDate)}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>権限</Text>
                <Text style={styles.previewValue}>
                  {preview.permission === 'edit' ? '編集可能' : '閲覧のみ'}
                </Text>
              </View>
            </View>

            <GradientButton
              onPress={handleJoin}
              label={joining ? '参加中...' : 'この旅行に参加する'}
              disabled={joining}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  heading: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  description: {
    fontSize: typography.fontSizes.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  input: {
    backgroundColor: colors.background.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    fontFamily: 'monospace',
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  spinner: {
    marginTop: spacing.lg,
  },
  previewCard: {
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  previewTitle: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
  },
  previewLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.text.tertiary,
  },
  previewValue: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
});
