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

export type ViewMode = 'list' | 'form' | 'detail';