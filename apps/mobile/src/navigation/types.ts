import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// メインスタックのパラメータ
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  TripCreate: undefined;
  TripEdit: { tripId: string };
  TripDetail: NavigatorScreenParams<TripTabParamList> & { tripId: string };
  Settings: undefined;
  AddSpot: { tripId: string; dayIndex: number };
  AddBudgetItem: { tripId: string };
  AddChecklistItem: { tripId: string; type: 'packing' | 'todo' };
  AddReservation: { tripId: string };
};

// メインタブのパラメータ
export type MainTabParamList = {
  TripList: undefined;
};

// 旅行詳細タブのパラメータ
export type TripTabParamList = {
  Schedule: { tripId: string };
  Budget: { tripId: string };
  Checklist: { tripId: string };
  Reservations: { tripId: string };
};

// 画面のProps型
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type TripTabScreenProps<T extends keyof TripTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TripTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
