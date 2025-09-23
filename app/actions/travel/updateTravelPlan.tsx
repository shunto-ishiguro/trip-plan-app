import { createClientSupabaseClient } from "@/lib/supabase/client";
import { TravelPlan } from "../../types/travel";
import { toDBTravelPlan } from "../../../lib/mappers/travelPlanMapper";

// 旅行プラン更新
export async function updateTravelPlan(planId: string, updates: Omit<TravelPlan, 'id' | 'activities'>): Promise<void> {
    const supabase = createClientSupabaseClient;

    const { error } = await supabase
        .from("travel_plans")
        .update({ ...toDBTravelPlan(updates), updated_at: new Date().toISOString() })
        .eq("id", planId)
        .select("*")
        .single();

    if (error) throw new Error(error.message);
}