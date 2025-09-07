import { supabase } from '../supabaseClient';
import { DBPlan, TravelPlan } from '../../app/types/travel';
//supabaseのプラン情報を取得、追加、更新するやつら

// 一覧取得
export async function getTravelPlans(userId: string | null): Promise<TravelPlan[]> {
    if(userId === null) return [] as TravelPlan[];
    //dataにデータベースからとってきたものをcreated_atの小さい順でもってくる
    const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    //エラーあったらエラーだすよ
    if (error) throw error;
    return data as TravelPlan[]; //型を明記
}

// 新規追加
export async function addTravelPlan(plan: DBPlan): Promise<DBPlan | null> { //Omitは'id''createdAt''updateAt'という要素を省いた状態のクラスを返すもの
    const { data, error } = await supabase
        .from('travel_plans')
        .insert([{ ...plan, created_at: new Date(), updated_at: new Date() }]) //new Date()は今の日付で入力される、要素一個の配列を挿入
        .select(); //データ持ってくる

    if (error){
        console.error('addTravelPlan エラー', error.message);
        return null;
    }
    return data[0];
}

// 更新
export async function updateTravelPlan(id: string, updates: Partial<TravelPlan>) { //Partial型はTravelPlanの一部だけでも引数にしていいよっていう型
    const { data, error } = await supabase
        .from('travel_plans')
        .update({ ...updates, updated_at: new Date() }) //渡された引数のところだけ追加しますよ
        .eq('id', id) //idが等しいやつだけ
        .select();

    if (error) throw error;
    return data[0];
}

// 削除
export async function deleteTravelPlan(id: string) {
    const { error } = await supabase.from('travel_plans').delete().eq('id', id);
    if (error) throw error;
}
