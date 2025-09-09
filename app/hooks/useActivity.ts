"use client";

import { useState, useEffect } from 'react';
import { Activity, TravelPlan } from '../types/travel';
import { getActivitiesByPlanIdAPI, addActivityAPI, updateActivityAPI, deleteActivityAPI } from '@/lib/api/activitiesApi';

export function useActivity(plan: TravelPlan, onUpdateActivities: (activities: Activity[]) => void) {
    const [activities, setActivities] = useState<Activity[]>(plan.activities || []);
    const [isAddingActivity, setIsAddingActivity] = useState(false);
    const [newActivity, setNewActivity] = useState<Omit<Activity, 'id' | 'plan_id'>>({
        title: '',
        description: '',
        date: new Date(),
        time: '',
        location: '',
        cost: 0,
        completed: false,
        category: 'sightseeing'
    });

    const [loading, setLoading] = useState(true);

    /** --- 初期ロード: プランIDからactivitiesを取得 --- */
    useEffect(() => {
        const fetchActivities = async () => {
            if (!plan.id) return;
            setLoading(true);
            try {
                const fetched = await getActivitiesByPlanIdAPI(plan.id);
                setActivities(fetched);
                onUpdateActivities(fetched);
            } catch (e) {
                console.error('Failed to fetch activities:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [plan.id, onUpdateActivities]);

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

    const addActivity = async () => {
        if (!newActivity.title) return;

        try {
            const savedActivity = await addActivityAPI({
                ...newActivity,
                plan_id: plan.id,
            });

            const updatedActivities = [...activities, savedActivity];
            setActivities(updatedActivities);
            onUpdateActivities(updatedActivities);

            setNewActivity({
                title: '',
                description: '',
                date: new Date(),
                time: '',
                location: '',
                cost: 0,
                completed: false,
                category: 'sightseeing'
            });
            setIsAddingActivity(false);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleActivityComplete = async (activityId: string) => {
        const target = activities.find(a => a.id === activityId);
        if (!target) return;

        try {
            const updated = await updateActivityAPI(activityId, { completed: !target.completed });

            const updatedActivities = activities.map(activity =>
                activity.id === activityId ? { ...activity, completed: updated.completed } : activity
            );
            setActivities(updatedActivities);
            onUpdateActivities(updatedActivities);
        } catch (e) {
            console.error(e);
        }
    };

    /** --- 更新 (任意のフィールド変更用) --- */
    const updateActivity = async (activityId: string, updates: Partial<Activity>) => {
        try {
            const updated = await updateActivityAPI(activityId, updates);

            const updatedActivities = activities.map(activity =>
                activity.id === activityId ? { ...activity, ...updated } : activity
            );
            setActivities(updatedActivities);
            onUpdateActivities(updatedActivities);
        } catch (e) {
            console.error(e);
        }
    };

    /** --- 削除 (delete API 使用) --- */
    const deleteActivity = async (activityId: string) => {
        try {
            await deleteActivityAPI(activityId);

            const updatedActivities = activities.filter(activity => activity.id !== activityId);
            setActivities(updatedActivities);
            onUpdateActivities(updatedActivities);
        } catch (e) {
            console.error(e);
        }
    };

    const groupedActivities = (activities || []).reduce((groups, activity) => {
        const dateKey = activity.date.toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(activity);
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