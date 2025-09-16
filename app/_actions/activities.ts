//app/_actions/activities

"use server";

import { createClient } from "../../lib/supabase/server";
import { Activity, DBActivity } from "../types/travel";
import { toDBActivity, toActivity } from '../../lib/mappers/activityMapper';

export async function getActivityAPI(planId: string): Promise<Activity[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("plan_id", planId)  // ←ここでプランを絞る
        .order("date", { ascending: true });

    if (error) throw new Error(error.message);

    const activitiesDB = data as DBActivity[];

    const activities = activitiesDB
        .map(d => toActivity(d))
        .filter((a): a is Activity => a !== null);

    return activities;
}

export async function addActivityAPI(planId: string, activity: Omit<Activity, "id">): Promise<Activity> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("activities")
        .insert([{ ...toDBActivity(activity), plan_id: planId }])
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    const inserted = data as DBActivity;
    const inserted_activity = toActivity(inserted);
    if (!inserted_activity) throw new Error('DBActivity変換エラー');
    return inserted_activity;
}

export async function updateActivityAPI(activityId: string, updates: Omit<Activity, 'id'>): Promise<Activity> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("activities")
        .update({ ...toDBActivity(updates), updated_at: new Date().toISOString() })
        .eq("id", activityId)
        .select("*")
        .single();

    if (error) throw new Error(error.message);

    const updated = data as DBActivity; // 単一オブジェクトとして扱う
    const updated_activity = toActivity(updated);
    if (!updated_activity) throw new Error('DBActivity変換エラー');
    return updated_activity;
}

export async function deleteActivityAPI(activityId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);

    if (error) throw new Error(error.message);
}
