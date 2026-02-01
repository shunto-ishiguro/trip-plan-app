import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>共有する</Text>
          </TouchableOpacity>

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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 10,
  },
  permissionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  permissionOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  permissionOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  permissionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  permissionTextActive: {
    color: '#3B82F6',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholderText: {
    fontSize: 16,
    color: '#6B7280',
  },
  qrPlaceholderSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  url: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  shareButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    color: '#6B7280',
  },
});
