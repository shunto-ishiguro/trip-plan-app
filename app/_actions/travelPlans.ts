//app/_actions/travelPlan.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { TravelPlan, DBTravelPlan } from "../types/travel";
import { toTravelPlan, toDBTravelPlan } from "../../lib/mappers/travelPlanMapper";

// 旅行プラン一覧取得
export async function getTravelPlanAPI(): Promise<TravelPlan[]> {
    const supabase = await createClient(); // ←ここを変更

    const { data, error } = await supabase
        .from("travel_plans")
        .select("*, activities(*)")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // API 層で変換
    const travelPlans = (data || [])
        .map(plan => toTravelPlan(plan))
        .filter((plan): plan is TravelPlan => plan !== null);

    return travelPlans;
}

// 新規旅行プラン作成
export async function addTravelPlanAPI(plan: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Promise<Omit<TravelPlan, 'activities'>> {
    const supabase = await createClient(); // ←ここも変更

    const { data, error } = await supabase
        .from("travel_plans")
        .insert([{ ...toDBTravelPlan(plan), created_at: new Date(), updated_at: new Date() }])
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    const inserted = (data as DBTravelPlan[])[0]; // 型アサーション
    const inserted_plan = toTravelPlan(inserted);
    if (!inserted_plan) throw new Error('DBTravelPlan変換エラー');

    return inserted_plan;
}

// 旅行プラン更新
export async function updateTravelPlanAPI(planId: string, updates: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Promise<Omit<TravelPlan, 'activities'>> {
    const supabase = await createClient(); // ←ここも変更

    const { data, error } = await supabase
        .from("travel_plans")
        .update({ ...toDBTravelPlan(updates), updated_at: new Date().toISOString() })
        .eq("id", planId)
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    const updated = (data as DBTravelPlan[])[0]; // 型アサーション
    const updated_plan = toTravelPlan(updated);
    if (!updated_plan) throw new Error('DBTravelPlan変換エラー');
    return updated_plan;
}

// 旅行プラン削除
export async function deleteTravelPlanAPI(planId: string): Promise<void> {
    const supabase = await createClient(); // ←ここも変更

    const { error } = await supabase
        .from("travel_plans")
        .delete()
        .eq("id", planId);

    if (error) throw new Error(error.message);
}
