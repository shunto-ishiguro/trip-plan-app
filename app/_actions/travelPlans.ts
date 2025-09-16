//app/_actions/travelPlan.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { TravelPlan, DBTravelPlan } from "../types/travel";
import { toTravelPlan, toDBTravelPlan } from "../../lib/mappers/travelPlanMapper";

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>;

// supabase をオプションで受け取るようにして、呼び出し側で使い回せるようにします。
// 引数がない場合は内部で生成（互換性のため）。
async function getCurrentUserId(supabase?: SupabaseClientType): Promise<string> {
    const client = supabase ?? (await createClient());
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) throw new Error("ログインユーザーが取得できません");
    return user.id;
}

// 旅行プラン一覧取得
export async function getTravelPlanAPI(): Promise<TravelPlan[]> {
    const supabase = await createClient();
    const userId = await getCurrentUserId(supabase);

    const { data, error } = await supabase
        .from("travel_plans")
        .select("id, title, destination, start_date, end_date, description, image_url, budget, currency, created_at, updated_at, activities(id, title, description, date, time, location, cost, completed, category, created_at, updated_at)")
        .eq("user_id", userId) // ← ユーザーごとの取得
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
    const userId = await getCurrentUserId(supabase);

    const { data, error } = await supabase
        .from("travel_plans")
        .insert([{ ...toDBTravelPlan(plan), user_id: userId, created_at: new Date(), updated_at: new Date() }])
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    const inserted = data as DBTravelPlan;
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

    const updated = data as DBTravelPlan;
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
