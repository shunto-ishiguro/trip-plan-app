import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiError } from '../api/auth';
import * as sharesApi from '../api/shares';
import { colors, radius, spacing, typography } from '../theme';
import type { ShareSettings } from '../types';
import { GradientButton } from './GradientButton';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
}

type Permission = 'view' | 'edit';

export function ShareSheet({ visible, onClose, tripId }: ShareSheetProps) {
  const [settings, setSettings] = useState<ShareSettings | null>(null);
  const [permission, setPermission] = useState<Permission>('view');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sharesApi.getShareSettings(tripId);
      setSettings(data);
      setPermission(data.permission);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setSettings(null);
      }
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (visible) fetchSettings();
  }, [visible, fetchSettings]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const created = await sharesApi.createShareSettings(tripId, permission);
      setSettings(created);
    } catch {
      Alert.alert('エラー', '共有設定の作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!settings) return;
    setSubmitting(true);
    try {
      const updated = await sharesApi.updateShareSettings(tripId, {
        isActive: !settings.isActive,
      });
      setSettings(updated);
    } catch {
      Alert.alert('エラー', '共有設定の更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermissionChange = async (newPermission: Permission) => {
    setPermission(newPermission);
    if (!settings) return;
    try {
      const updated = await sharesApi.updateShareSettings(tripId, {
        permission: newPermission,
      });
      setSettings(updated);
    } catch {
      Alert.alert('エラー', '権限の変更に失敗しました');
      setPermission(settings.permission);
    }
  };

  const handleCopy = async () => {
    if (!settings) return;
    await Clipboard.setStringAsync(settings.shareToken);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('コピーしました', '合言葉をクリップボードにコピーしました');
  };

  const formatPassphrase = (token: string) => token.split('').join(' ');

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }

    // 状態A: 未作成
    if (!settings) {
      return (
        <>
          <PermissionToggle permission={permission} onChange={setPermission} />
          <View style={styles.createButtonContainer}>
            <GradientButton
              onPress={handleCreate}
              label={submitting ? '作成中...' : '共有を有効にする'}
              disabled={submitting}
            />
          </View>
        </>
      );
    }

    // 状態C: 停止中
    if (!settings.isActive) {
      return (
        <>
          <View style={styles.inactiveContainer}>
            <Text style={styles.inactiveText}>共有は停止中です</Text>
          </View>
          <View style={styles.createButtonContainer}>
            <GradientButton
              onPress={handleToggleActive}
              label={submitting ? '処理中...' : '共有を再開する'}
              disabled={submitting}
            />
          </View>
        </>
      );
    }

    // 状態B: 有効
    return (
      <>
        <PermissionToggle permission={permission} onChange={handlePermissionChange} />

        <Text style={styles.passphraseLabel}>この合言葉を相手に伝えてください</Text>
        <View style={styles.passphraseContainer}>
          <Text style={styles.passphraseText}>{formatPassphrase(settings.shareToken)}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            <Text style={styles.copyButtonText}>コピー</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleToggleActive}
          disabled={submitting}
        >
          <Text style={styles.stopButtonText}>{submitting ? '処理中...' : '共有を停止する'}</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>旅行を共有</Text>
          {renderContent()}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>閉じる</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function PermissionToggle({
  permission,
  onChange,
}: {
  permission: Permission;
  onChange: (p: Permission) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>権限設定</Text>
      <View style={styles.permissionRow}>
        <TouchableOpacity
          style={[styles.permissionOption, permission === 'view' && styles.permissionOptionActive]}
          onPress={() => onChange('view')}
        >
          <Text
            style={[styles.permissionText, permission === 'view' && styles.permissionTextActive]}
          >
            閲覧のみ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionOption, permission === 'edit' && styles.permissionOptionActive]}
          onPress={() => onChange('edit')}
        >
          <Text
            style={[styles.permissionText, permission === 'edit' && styles.permissionTextActive]}
          >
            編集も可能
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.primary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.base,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  loadingContainer: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.tertiary,
    marginBottom: 10,
  },
  permissionRow: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  permissionOption: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border.primary,
    alignItems: 'center',
  },
  permissionOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  permissionText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.tertiary,
  },
  permissionTextActive: {
    color: colors.accent,
  },
  passphraseLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  passphraseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  passphraseText: {
    flex: 1,
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    fontFamily: 'monospace',
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 4,
  },
  copyButton: {
    backgroundColor: colors.border.primary,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginLeft: spacing.md,
  },
  copyButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  createButtonContainer: {
    marginBottom: spacing.base,
  },
  inactiveContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  inactiveText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.tertiary,
  },
  stopButton: {
    paddingVertical: spacing.base,
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  stopButtonText: {
    fontSize: typography.fontSizes.lg,
    color: colors.semantic.error,
    fontWeight: typography.fontWeights.medium,
  },
  closeButton: {
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.tertiary,
  },
});
