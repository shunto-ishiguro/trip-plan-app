import { createClientSupabaseClient } from "@/lib/supabase/client";
// 旅行プラン削除
export async function deleteTravelPlan(planId: string): Promise<void> {
    const supabase = createClientSupabaseClient;

    const { error } = await supabase
        .from("travel_plans")
        .delete()
        .eq("id", planId);

    if (error) throw new Error(error.message);
}