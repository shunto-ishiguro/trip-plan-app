//app/hooks/useActivity.ts

"use client";

import { useState, useEffect } from "react";
import { Activity, TravelPlan } from "../types/travel";
import { getActivityAPI, addActivityAPI, updateActivityAPI, deleteActivityAPI } from "@/app/_actions/activities";

export function useActivity(plan: TravelPlan, onUpdateActivities: (activities: Activity[]) => void) {
    const [activities, setActivities] = useState<Activity[]>(plan.activities || []);
    const [isAddingActivity, setIsAddingActivity] = useState(false);
    const [newActivity, setNewActivity] = useState<Omit<Activity, "id">>({
        title: "",
        description: "",
        date: new Date(),
        time: "",
        location: "",
        cost: 0,
        completed: false,
        category: "sightseeing",
    });

    useEffect(() => {

        if (!plan.id) return; // plan がまだロードされていない場合は何もしない

        getActivityAPI(plan.id)
            .then(fetched => {
                setActivities(fetched);
                onUpdateActivities(fetched);
            })
            .catch(console.error)
    }, [plan.id, onUpdateActivities]);

    const addActivity = async () => {
        if (!newActivity.title) return;
        const saved = await addActivityAPI(plan.id, newActivity);
        const updated = [...activities, saved];
        setActivities(updated);
        onUpdateActivities(updated);
        setNewActivity({ title: "", description: "", date: new Date(), time: "", location: "", cost: 0, completed: false, category: "sightseeing" });
        setIsAddingActivity(false);
    };

    const toggleActivityComplete = async (activityId: string) => {
        const target = activities.find(a => a.id === activityId);
        if (!target) return;
        const { id, completed, ...others } = target;
        const updated = await updateActivityAPI(activityId, { completed: !target.completed, ...others });
        const newList = activities.map(a => a.id === activityId ? { ...a, completed: updated.completed } : a);
        setActivities(newList);
        onUpdateActivities(newList);
    };

    const deleteActivity = async (activityId: string) => {
        await deleteActivityAPI(activityId);
        const newList = activities.filter(a => a.id !== activityId);
        setActivities(newList);
        onUpdateActivities(newList);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const getDaysCount = () => {
        const start = plan.startDate ? new Date(plan.startDate) : new Date();
        const end = plan.endDate ? new Date(plan.endDate) : new Date();
        const timeDiff = end.getTime() - start.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    };

    const getTotalCost = () => {
        return (activities || []).reduce((total, activity) => total + (activity.cost || 0), 0);
    };

    const groupedActivities = activities.reduce((groups, activity) => {
        const key = activity.date.toDateString();
        if (!groups[key]) groups[key] = [];
        groups[key].push(activity);
        return groups;
    }, {} as Record<string, Activity[]>);

    return {
        activities, setActivities,
        isAddingActivity, setIsAddingActivity,
        newActivity, setNewActivity,
        formatDate,
        getDaysCount,
        getTotalCost,
        addActivity,
        toggleActivityComplete,
        deleteActivity,
        groupedActivities
    }
}
