import { supabase } from '../supabaseClient';
import { Activity } from '../../app/types/travel';
//特定のプランのアクティビティを取得、更新、追加するやつら

// 特定の旅行プランに紐づくアクティビティ一覧を取ってくる
export async function getActivitiesByPlanId(planId: string) {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('plan_id', planId)   // travel_plans.id と紐付け
        .order('date', { ascending: true })  // 日付順に並べるのが自然かも
        .order('time', { ascending: true });

    if (error) throw error;
    return data;
}

export async function addActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
        .from('activities')
        .insert([{ ...activity, created_at: new Date(), updated_at: new Date() }])
        .select();

    if (error) throw error;
    return data[0];
}

export async function updateActivity(id: string, updates: Partial<Activity>) {
    const { data, error } = await supabase
        .from('activities')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
}

export async function deleteActivity(id: string) {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) throw error;
}
