import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  AddBudgetItemScreen,
  AddChecklistItemScreen,
  AddReservationScreen,
  AddSpotScreen,
  JoinTripScreen,
  SettingsScreen,
  TripCreateScreen,
  TripListScreen,
} from '../screens';
import { colors, typography } from '../theme';
import { AuthNavigator } from './AuthNavigator';
import { TripTabNavigator } from './TripTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user == null ? (
        <AuthNavigator />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background.card,
            },
            headerTintColor: colors.text.primary,
            headerTitleStyle: {
              fontWeight: typography.fontWeights.semibold,
            },
            headerShadowVisible: false,
            headerBackTitle: '',
          }}
        >
          <Stack.Screen
            name="Main"
            component={TripListScreen}
            options={({ navigation }) => ({
              headerShown: true,
              headerTitle: '',
              headerRight: () => (
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              ),
              headerLeft: () => null,
            })}
          />
          <Stack.Screen
            name="TripCreate"
            component={TripCreateScreen}
            options={{
              title: '新しい旅行',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="TripEdit"
            component={TripCreateScreen}
            options={{
              title: '旅行を編集',
            }}
          />
          <Stack.Screen
            name="TripDetail"
            component={TripTabNavigator}
            options={({ route }) => ({
              title: (route.params as { tripTitle?: string })?.tripTitle ?? '旅行詳細',
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: '設定',
            }}
          />
          <Stack.Screen
            name="AddSpot"
            component={AddSpotScreen}
            options={{
              title: 'スポットを追加',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="AddBudgetItem"
            component={AddBudgetItemScreen}
            options={{
              title: '予算項目を追加',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="AddChecklistItem"
            component={AddChecklistItemScreen}
            options={{
              title: 'チェックリストに追加',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="AddReservation"
            component={AddReservationScreen}
            options={{
              title: '予約を追加',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="JoinTrip"
            component={JoinTripScreen}
            options={{
              title: '旅行に参加',
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  settingsButton: {
    padding: 8,
  },
});
