'use server';

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TravelPlan } from "../../types/travel";
import { toTravelPlan } from "../../../lib/mappers/travelPlanMapper";

async function getCurrentUserId() {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("ログインユーザーが取得できません");
    return user.id;
}

// 旅行プラン一覧取得
export async function getTravelPlans(): Promise<TravelPlan[]> {
    const supabase = createServerSupabaseClient();
    const userId = await getCurrentUserId();

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