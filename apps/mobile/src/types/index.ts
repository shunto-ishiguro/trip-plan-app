// 旅行
export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

// スポット
export interface Spot {
  id: string;
  tripId: string;
  dayIndex: number;
  order: number;
  name: string;
  address?: string;
  startTime?: string;
  endTime?: string;
  memo?: string;
  latitude?: number;
  longitude?: number;
}

// 予算項目
export interface BudgetItem {
  id: string;
  tripId: string;
  category: 'transport' | 'accommodation' | 'food' | 'activity' | 'other';
  name: string;
  amount: number;
  pricingType: 'total' | 'per_person';
  memo?: string;
}

// チェックリスト項目
export interface ChecklistItem {
  id: string;
  tripId: string;
  type: 'packing' | 'todo';
  text: string;
  checked: boolean;
}

// 予約情報
export interface Reservation {
  id: string;
  tripId: string;
  type: 'flight' | 'hotel' | 'rental_car' | 'restaurant' | 'activity' | 'other';
  name: string;
  confirmationNumber?: string;
  datetime?: string;
  link?: string;
  memo?: string;
}

// 共有設定
export interface ShareSettings {
  id: string;
  tripId: string;
  shareUrl: string | null;
  permission: 'view' | 'edit';
  shareToken: string;
  isActive: boolean;
  createdBy: string | null;
}

// 旅行プレビュー（合言葉で取得）
export interface TripPreview {
  tripId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  permission: 'view' | 'edit';
}

// 旅行参加結果
export interface JoinResult {
  message: string;
  tripId: string;
  role?: string;
}
