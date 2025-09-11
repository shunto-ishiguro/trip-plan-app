import { supabaseServerClient } from '../supabaseServer';
import { DBPlan, TravelPlan } from '../../app/types/travel';
import { toDBPlan, toTravelPlan } from '../mappers/travelPlanMapper';
//このファイルでDBPlan型->TravelPlan型またはTravelPlan型->DBPlan型やっちゃうで

// 一覧取得
export async function getTravelPlanAPI(userId: string | null): Promise<TravelPlan[]> {
    const supabase = supabaseServerClient();
    if (userId === null) return [];
    //dataにデータベースからとってきたものをcreated_atの小さい順でもってくる
    const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    // API 層で変換
    const travelPlans = (data || [])
        .map(plan => toTravelPlan(plan))
        .filter((plan): plan is TravelPlan => plan !== null);

    return travelPlans;
}

//新規作成
export async function addTravelPlanAPI(plan: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Promise<Omit<TravelPlan, 'activities'>> {
    const supabase = supabaseServerClient();
    const { data, error } = await supabase
        .from('travel_plans')
        .insert([{ ...toDBPlan(plan), created_at: new Date(), updated_at: new Date() }])
        .select();

    if (error) throw error;

    const inserted = (data as DBPlan[])[0]; // 型アサーション
    const inserted_plan = toTravelPlan(inserted);
    if (!inserted_plan) throw new Error('DBPlan変換エラー');

    return inserted_plan;
}

//更新
export async function updateTravelPlanAPI(id: string, updates: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Promise<Omit<TravelPlan, 'activities'>> {
    const supabase = supabaseServerClient();

    const { data, error } = await supabase
        .from('travel_plans')
        .update({ ...toDBPlan(updates), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

    if (error) throw error;

    const updated = (data as DBPlan[])[0]; // 型アサーション
    const updated_plan = toTravelPlan(updated);
    if (!updated_plan) throw new Error('DBPlan変換エラー');
    return updated_plan;
}

// 削除
export async function deleteTravelPlanAPI(id: string): Promise<void> {
    const supabase = supabaseServerClient();
    const { error } = await supabase.from('travel_plans').delete().eq('id', id);
    if (error) throw error;
}
