
import { supabase } from '../supabaseClient';
import { Activity, DBActivity } from '../../app/types/travel';
import { toDBActivity, toActivity } from '../mappers/activityMapper';

// 取得
export async function getActivitiesByPlanIdAPI(planId: string): Promise<Activity[]> {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('plan_id', planId)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

    if (error) throw error;

    // data は unknown[] 型として返ることがあるので、型アサーションで DBActivity[] にする
    const activitiesDB = data as DBActivity[];

    const activitiesFront = activitiesDB
        .map(d => toActivity(d))
        .filter((a): a is Activity => a !== null);

    return activitiesFront;
}

// 追加
export async function addActivityAPI(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const { data, error } = await supabase
        .from('activities') // 型パラメータ削除
        .insert([{ ...toDBActivity(activity), created_at: new Date(), updated_at: new Date() }])
        .select();

    if (error) throw error;

    const inserted = (data as DBActivity[])[0]; // 型アサーション
    const inserted_activity = toActivity(inserted);
    if (!inserted_activity) throw new Error('DBActivity変換エラー');
    return { ...inserted_activity, plan_id: activity.plan_id };
}

// 更新
export async function updateActivityAPI(id: string, updates: Omit<Activity, 'id'>): Promise<Omit<Activity, 'plan_id'>> {
    const { data, error } = await supabase
        .from('activities') // 型パラメータ削除
        .update({ ...toDBActivity(updates), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

    if (error) throw error;

    const updated = (data as DBActivity[])[0]; // 型アサーション
    const updated_activity = toActivity(updated);
    if (!updated_activity) throw new Error('DBActivity変換エラー');
    return updated_activity;
}

// 削除
export async function deleteActivityAPI(id: string): Promise<void> {
    const { error } = await supabase.from('activities').delete().eq('id', id);

    if (error) throw error;
}
