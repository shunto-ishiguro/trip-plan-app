//app/hooks/useTravelPlan.ts

"use client";
import { useState, useEffect } from 'react';
import { TravelPlan, Activity, ViewMode } from '../types/travel';
import { getTravelPlanAPI, addTravelPlanAPI, deleteTravelPlanAPI, updateTravelPlanAPI } from '../_actions/travelPlans';

export function useTravelPlan() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPlan, setEditingPlan] = useState<TravelPlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([]);

  useEffect(() => {

    getTravelPlanAPI().then(setPlans).catch(console.error);
  }, []);


  const handleCreatePlan = async (planData: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { activities, ...travelPlanWithoutActivities } = planData;
    const newPlan = await addTravelPlanAPI(travelPlanWithoutActivities);
    setPlans([...plans, { ...newPlan, activities }]);
    setViewMode('list');
  };

  const handleUpdatePlan = async (planData: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPlan) return;
    const { activities, ...planWithoutActivities } = planData;
    const updated = await updateTravelPlanAPI(editingPlan.id, planWithoutActivities);
    if (updated) setPlans(plans.map(p => p.id === editingPlan.id ? { ...updated, activities } : p));
    setEditingPlan(null);
    setViewMode('list');
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('この旅行プランを削除しますか？')) {
      await deleteTravelPlanAPI(planId);
      setPlans(plans.filter(p => p.id !== planId));
    }
  };

  const handleViewPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setViewMode('detail');
  };

  const handleEditPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setEditingPlan(plan);
      setViewMode('form');
    }
  };

  const handleUpdateActivities = async (planId: string, activities: Activity[]) => {
    setPlans(plans.map(plan =>
      plan.id === planId
        ? { ...plan, activities, updatedAt: new Date() }
        : plan
    ));
  };

  const selectedPlan = selectedPlanId ? plans.find(p => p.id === selectedPlanId) : null;

  return {
    viewMode, setViewMode,
    editingPlan, setEditingPlan,
    selectedPlan, setSelectedPlanId,
    plans, setPlans,
    handleCreatePlan,
    handleDeletePlan,
    handleEditPlan,
    handleUpdateActivities,
    handleUpdatePlan,
    handleViewPlan
  };
}