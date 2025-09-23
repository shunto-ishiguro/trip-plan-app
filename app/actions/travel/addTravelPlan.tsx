import { createClientSupabaseClient } from "@/lib/supabase/client";
import { TravelPlan } from "../../types/travel";
import { toDBTravelPlan } from "../../../lib/mappers/travelPlanMapper";

async function getCurrentUserId() {
    const supabase = createClientSupabaseClient;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("ログインユーザーが取得できません");
    return user.id;
}

//新規旅行プラン作成
export async function addTravelPlan(plan: Omit<TravelPlan, 'id' | 'activities'>): Promise<string> {
    const supabase = createClientSupabaseClient;
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from("travel_plans")
        .insert([{ ...toDBTravelPlan(plan), user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    return data.id;
}