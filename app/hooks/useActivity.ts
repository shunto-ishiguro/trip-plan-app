"use client";
import { useState } from 'react';
import { Activity, ActivityCategory, TravelPlan } from '../types/travel';

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

    const addActivity = () => {
        if (!newActivity.title) return;

        const activity: Activity = {
            id: Date.now().toString(),
            plan_id: plan.id,
            title: newActivity.title,
            description: newActivity.description || '',
            date: newActivity.date || new Date(),
            time: newActivity.time || '',
            location: newActivity.location || '',
            cost: newActivity.cost || 0,
            completed: false,
            category: newActivity.category as ActivityCategory
        };

        const updatedActivities = [...activities, activity];
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
    };

    const toggleActivityComplete = (activityId: string) => {
        const updatedActivities = activities.map(activity =>
            activity.id === activityId
                ? { ...activity, completed: !activity.completed }
                : activity
        );
        setActivities(updatedActivities);
        onUpdateActivities(updatedActivities);
    };

    const deleteActivity = (activityId: string) => {
        const updatedActivities = activities.filter(activity => activity.id !== activityId);
        setActivities(updatedActivities);
        onUpdateActivities(updatedActivities);
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