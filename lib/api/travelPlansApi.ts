import { supabase } from '../supabaseClient';
import { DBPlan, TravelPlan } from '../../app/types/travel';
import { toDBPlan, toTravelPlan } from '../mappers/travelPlanMapper';
//supabaseのプラン情報を取得、追加、更新するやつら
//このファイルでDBPlan型->TravelPlan型またはTravelPlan型->DBPlan型やっちゃうで

// 一覧取得
export async function getTravelPlanAPI(userId: string | null): Promise<TravelPlan[]> {
    if (userId === null) return [];
    //dataにデータベースからとってきたものをcreated_atの小さい順でもってくる
    const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    //エラーあったらエラーだすよ
    if (error) throw error;
    // API 層で変換
    const travelPlans = (data || [])
        .map(plan => toTravelPlan(plan))
        .filter((plan): plan is TravelPlan => plan !== null);

    return travelPlans;
}

//新規作成
// DBPlan 型で保存して、戻り値を TravelPlan 型で返す
export async function addTravelPlanAPI(plan: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Promise<Omit<TravelPlan, 'activities'> | null> {
    const dbPlan: DBPlan = toDBPlan(plan);
    const { data, error } = await supabase
        .from('travel_plans')
        .insert([{ ...dbPlan, created_at: new Date(), updated_at: new Date() }])
        .select();

    if (error || !data?.[0]) {
        console.error('addTravelPlanAPI エラー', error?.message);
        return null;
    }

    return toTravelPlan(data[0]);
}

//更新
export async function updateTravelPlanAPI(
    id: string,
    updates: Partial<Omit<TravelPlan, 'activities'>>
): Promise<Omit<TravelPlan, 'activities'> | null> {
    const dbUpdates: Partial<DBPlan> = {
        ...toDBPlan(updates as any), // camelCase → snake_case に変換
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('travel_plans')
        .update(dbUpdates)
        .eq('id', id)
        .select();

    if (error || !data?.[0]) {
        console.error('updateTravelPlanAPI エラー', error?.message);
        return null;
    }

    return toTravelPlan(data[0]);
}

// 削除
export async function deleteTravelPlanAPI(id: string) {
    const { error } = await supabase.from('travel_plans').delete().eq('id', id);
    if (error) throw error;
}
