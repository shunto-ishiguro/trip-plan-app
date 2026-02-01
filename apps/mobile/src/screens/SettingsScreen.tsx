import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Theme = 'light' | 'dark' | 'system';

export function SettingsScreen() {
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
      { text: 'ログアウト', style: 'destructive', onPress: () => console.log('Logout') },
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
              <Text style={styles.rowValue}>user@example.com</Text>
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
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={notificationsEnabled ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>出発前リマインダー</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={reminderEnabled ? '#3B82F6' : '#F3F4F6'}
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
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  rowValue: {
    fontSize: 15,
    color: '#6B7280',
  },
  rowArrow: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  appVersion: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
