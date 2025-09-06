// lib/api.ts
import { supabase } from './supabaseClient';
import { TravelPlan } from '../app/types/travel'; // TravelPlan 型を使う場合

// 旅行プラン一覧を取得
export async function getTravelPlans(): Promise<TravelPlan[]> {
    const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching travel plans:', error);
        return [];
    }

    return data as TravelPlan[];
}

// 必要に応じて他の CRUD 関数もここに追加
// 例: addTravelPlan, updateTravelPlan, deleteTravelPlan
