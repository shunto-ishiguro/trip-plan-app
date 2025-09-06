import { supabase } from '../supabaseClient';
import { TravelPlan } from '../../app/types/travel';
//supabaseのプラン情報を取得、追加、更新するやつら


// 一覧取得
export async function getTravelPlans(): Promise<TravelPlan[]> {
    const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as TravelPlan[];
}

// 新規追加
export async function addTravelPlan(plan: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
        .from('travel_plans')
        .insert([{ ...plan, created_at: new Date(), updated_at: new Date() }])
        .select();

    if (error) throw error;
    return data[0];
}

// 更新
export async function updateTravelPlan(id: string, updates: Partial<TravelPlan>) {
    const { data, error } = await supabase
        .from('travel_plans')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
}

// 削除
export async function deleteTravelPlan(id: string) {
    const { error } = await supabase.from('travel_plans').delete().eq('id', id);
    if (error) throw error;
}
