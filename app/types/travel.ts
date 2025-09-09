export interface TravelPlan {
    id: string;
    user_id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    imageUrl?: string;
    budget: number;
    currency: string;
    activities: Activity[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Activity {
    id: string;
    plan_id: string;
    title: string;
    description?: string;
    date: Date;
    time?: string;
    location?: string;
    cost?: number;
    completed: boolean;
    category: ActivityCategory;
}

export type ActivityCategory =
    | 'sightseeing'
    | 'restaurant'
    | 'accommodation'
    | 'transportation'
    | 'shopping'
    | 'entertainment'
    | 'other';

export interface BudgetItem {
    id: string;
    category: string;
    amount: number;
    description: string;
}

export interface DBPlan {
    id?: string,
    user_id: string,
    title: string,
    destination: string,
    start_date: string,
    end_date: string,
    description?: string,
    image_url?: string,
    budget: number,
    currency: string,
    created_at?: string,
    updated_at?: string
};

export interface DBActivity {
    id?: string;           // uuid, 自動生成されるのでオプショナル
    plan_id: string;       // どのプランに属するか
    title: string;         // 必須
    description?: string;  // 任意
    date?: string;         // 日付文字列（YYYY-MM-DD 形式など）
    time?: string;         // 時刻文字列（HH:MM 形式など）
    location?: string;     // 任意
    cost?: number;         // 任意
    completed?: boolean;   // デフォルト false
    category?: string;     // 任意
    created_at?: string;   // タイムスタンプ文字列、自動生成されるのでオプショナル
    updated_at?: string;   // タイムスタンプ文字列、自動生成されるのでオプショナル
}

export type ViewMode = 'list' | 'form' | 'detail';