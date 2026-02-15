import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors, radius, spacing, typography } from '../theme';

type Theme = 'light' | 'dark' | 'system';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<Theme>('system');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const handleThemeChange = () => {
    Alert.alert('テーマ選択', '表示テーマを選択してください', [
      { text: 'ライト', onPress: () => setTheme('light') },
      { text: 'ダーク', onPress: () => setTheme('dark') },
      { text: 'システム設定に従う', onPress: () => setTheme('system') },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  };

  const themeLabel = {
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム設定に従う',
  }[theme];

  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'ログアウト', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* アカウント */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowLabel}>プロフィール</Text>
              <Text style={styles.rowValue}>編集</Text>
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowLabel}>メールアドレス</Text>
              <Text style={styles.rowValue}>{user?.email ?? ''}</Text>
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowLabel}>パスワード変更</Text>
              <Text style={styles.rowArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 表示設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>表示設定</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={handleThemeChange}>
              <Text style={styles.rowLabel}>テーマ</Text>
              <Text style={styles.rowValue}>{themeLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 通知設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知設定</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>プッシュ通知</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border.primary, true: colors.accentLight }}
                thumbColor={notificationsEnabled ? colors.accent : colors.background.elevated}
              />
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>出発前リマインダー</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.border.primary, true: colors.accentLight }}
                thumbColor={reminderEnabled ? colors.accent : colors.background.elevated}
              />
            </View>
          </View>
        </View>

        {/* その他 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>その他</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowLabel}>利用規約</Text>
              <Text style={styles.rowArrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowLabel}>プライバシーポリシー</Text>
              <Text style={styles.rowArrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowLabel}>お問い合わせ</Text>
              <Text style={styles.rowArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ログアウト */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>ログアウト</Text>
          </TouchableOpacity>
        </View>

        {/* アプリ情報 */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Trip Plan</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border.secondary,
    marginLeft: spacing.lg,
  },
  rowLabel: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.primary,
  },
  rowValue: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.tertiary,
  },
  rowArrow: {
    fontSize: typography.fontSizes.xl,
    color: colors.text.quaternary,
  },
  logoutButton: {
    backgroundColor: colors.background.card,
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: typography.fontSizes.xl,
    color: colors.semantic.error,
    fontWeight: typography.fontWeights.medium,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  appName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.secondary,
  },
  appVersion: {
    fontSize: typography.fontSizes.md,
    color: colors.text.quaternary,
    marginTop: spacing.xs,
  },
});
