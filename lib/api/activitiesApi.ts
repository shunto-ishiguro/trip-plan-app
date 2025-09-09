
import { supabase } from '../supabaseClient';
import { Activity, DBActivity } from '../../app/types/travel';
import { toDBActivity, toActivity } from '../mappers/activityMapper';

// 取得
export async function getActivitiesByPlanIdAPI(planId: string): Promise<Activity[]> {
    const { data, error } = await supabase
        .from('activities') // ここは型パラメータなし
        .select('*')
        .eq('plan_id', planId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

    if (error) throw error;

    // data は unknown[] 型として返ることがあるので、型アサーションで DBActivity[] にする
    const activitiesDB = data as DBActivity[];

    // DBActivity → Activity に変換
    const activitiesFront = activitiesDB
        .map(d => toActivity(d))
        .filter((a): a is Activity => a !== null);

    return activitiesFront;
}

// 追加
export async function addActivityAPI(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const dbActivity = toDBActivity(activity);
    const { data, error } = await supabase
        .from('activities') // 型パラメータ削除
        .insert([{ ...dbActivity, created_at: new Date(), updated_at: new Date() }])
        .select();

    if (error) throw error;

    const inserted = (data as DBActivity[])[0]; // 型アサーション
    const act = toActivity(inserted);
    if (!act) throw new Error('DBActivity変換エラー');
    return { ...act, plan_id: activity.plan_id };
}

// 更新
export async function updateActivityAPI(id: string, updates: Partial<Activity>): Promise<Omit<Activity, 'plan_id'>> {
    const { data, error } = await supabase
        .from('activities') // 型パラメータ削除
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select();

    if (error) throw error;

    const updated = (data as DBActivity[])[0]; // 型アサーション
    const act = toActivity(updated);
    if (!act) throw new Error('DBActivity変換エラー');
    return act;
}

// 削除
export async function deleteActivityAPI(id: string) {
    const { error } = await supabase
        .from('activities') // 型パラメータ削除
        .delete()
        .eq('id', id);

    if (error) throw error;
}
