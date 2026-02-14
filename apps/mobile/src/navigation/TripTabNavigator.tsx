import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShareSheet } from '../components';
import { BudgetScreen, ChecklistScreen, ReservationsScreen, ScheduleScreen } from '../screens';
import { colors, typography } from '../theme';
import type { RootStackParamList, TripTabParamList } from './types';

const Tab = createBottomTabNavigator<TripTabParamList>();

type IoniconsName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof TripTabParamList, IoniconsName> = {
  Schedule: 'calendar-outline',
  Budget: 'wallet-outline',
  Checklist: 'checkbox-outline',
  Reservations: 'document-text-outline',
};

const TAB_LABELS: Record<keyof TripTabParamList, string> = {
  Schedule: '行程',
  Budget: '予算',
  Checklist: 'チェック',
  Reservations: '予約',
};

export function TripTabNavigator() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tripId } = route.params as { tripId: string };

  const [shareVisible, setShareVisible] = useState(false);

  // ヘッダー右側に共有ボタンを追加
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={() => setShareVisible(true)}>
          <Text style={styles.headerButtonText}>共有</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
          ),
          tabBarLabel: TAB_LABELS[route.name],
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        })}
      >
        <Tab.Screen name="Schedule" component={ScheduleScreen} initialParams={{ tripId }} />
        <Tab.Screen name="Budget" component={BudgetScreen} initialParams={{ tripId }} />
        <Tab.Screen name="Checklist" component={ChecklistScreen} initialParams={{ tripId }} />
        <Tab.Screen name="Reservations" component={ReservationsScreen} initialParams={{ tripId }} />
      </Tab.Navigator>

      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        tripId={tripId}
        tripTitle="京都旅行"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: typography.fontSizes.xl,
    color: colors.accent,
    fontWeight: typography.fontWeights.medium,
  },
  tabBar: {
    backgroundColor: colors.background.card,
    borderTopColor: colors.border.primary,
    height: 90,
    paddingBottom: 28,
    paddingTop: 8,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    marginTop: 2,
  },
});
