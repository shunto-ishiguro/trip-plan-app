import { DBActivity, Activity, ActivityCategory } from '../../app/types/travel';

// Activity型からDBActivity型に変換（DB挿入用）
export function toDBActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): DBActivity {
    return {
        plan_id: activity.plan_id,
        title: activity.title,
        description: activity.description,
        date: activity.date ? activity.date.toISOString().split('T')[0] : undefined, // YYYY-MM-DD 形式
        time: activity.time,
        location: activity.location,
        cost: activity.cost,
        completed: activity.completed,
        category: activity.category
    };
}

export function toActivity(dbActivity: DBActivity): Omit<Activity, 'plan_id'> | null {
    if (!dbActivity.id || !dbActivity.created_at || !dbActivity.updated_at) {
        console.error("toActivityでDBActivityが一部nullです");
        return null;
    }

    return {
        id: dbActivity.id,
        title: dbActivity.title,
        description: dbActivity.description,
        date: dbActivity.date ? new Date(dbActivity.date) : new Date(),
        time: dbActivity.time,
        location: dbActivity.location,
        cost: dbActivity.cost,
        completed: dbActivity.completed ?? false,
        category: dbActivity.category as ActivityCategory ?? 'other',
    };
}
