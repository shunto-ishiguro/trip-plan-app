import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { GradientButton } from './GradientButton';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
}

type Permission = 'view' | 'edit';

export function ShareSheet({ visible, onClose, tripId, tripTitle }: ShareSheetProps) {
  const [permission, setPermission] = useState<Permission>('view');

  // モックのシェアURL
  const shareUrl = `https://tripplan.app/trip/${tripId}?p=${permission}`;

  const handleCopyUrl = async () => {
    await Clipboard.setStringAsync(shareUrl);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('コピーしました', 'URLをクリップボードにコピーしました');
  };

  const handleShare = async () => {
    try {
      const message = `「${tripTitle}」の旅行プランを共有します！\n${shareUrl}`;
      await Share.share({
        message,
        url: shareUrl,
        title: tripTitle,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>旅行を共有</Text>

          {/* 権限設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>権限設定</Text>
            <View style={styles.permissionRow}>
              <TouchableOpacity
                style={[
                  styles.permissionOption,
                  permission === 'view' && styles.permissionOptionActive,
                ]}
                onPress={() => setPermission('view')}
              >
                <Text
                  style={[
                    styles.permissionText,
                    permission === 'view' && styles.permissionTextActive,
                  ]}
                >
                  閲覧のみ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.permissionOption,
                  permission === 'edit' && styles.permissionOptionActive,
                ]}
                onPress={() => setPermission('edit')}
              >
                <Text
                  style={[
                    styles.permissionText,
                    permission === 'edit' && styles.permissionTextActive,
                  ]}
                >
                  編集も可能
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* QRコードプレースホルダー */}
          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>QRコード</Text>
              <Text style={styles.qrPlaceholderSubtext}>(react-native-qrcode-svg で実装)</Text>
            </View>
          </View>

          {/* URL表示 */}
          <View style={styles.urlContainer}>
            <Text style={styles.url} numberOfLines={1} ellipsizeMode="middle">
              {shareUrl}
            </Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyUrl}>
              <Text style={styles.copyButtonText}>コピー</Text>
            </TouchableOpacity>
          </View>

          {/* 共有ボタン */}
          <View style={styles.shareButtonContainer}>
            <GradientButton onPress={handleShare} label="共有する" />
          </View>

          {/* 閉じるボタン */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>閉じる</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
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
  qrContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: colors.background.elevated,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholderText: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.tertiary,
  },
  qrPlaceholderSubtext: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.quaternary,
    marginTop: spacing.xs,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  url: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    fontFamily: 'monospace',
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
  shareButtonContainer: {
    marginBottom: spacing.base,
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
