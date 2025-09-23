//app/hooks/useTravelPlan.ts

"use client";
import { useState } from 'react';
import { TravelPlan, Activity, ViewMode } from '../types/travel';
import { addTravelPlan } from '../actions/travel/addTravelPlan';
import { updateTravelPlan } from '../actions/travel/updateTravelPlan';
import { deleteTravelPlan } from '../actions/travel/deleteTravelPlan';

export function useTravelPlan(initialPlans: TravelPlan[]) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPlan, setEditingPlan] = useState<TravelPlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>(initialPlans);

  const handleCreatePlan = async (planData: Omit<TravelPlan, 'id'>) => {
    const { activities, ...travelPlanWithoutActivities } = planData;
    const newPlanId = await addTravelPlan(travelPlanWithoutActivities);
    setPlans([...plans, { ...planData, id: newPlanId }]);
    setViewMode('list');
  };

  const handleUpdatePlan = async (planData: Omit<TravelPlan, 'id'>) => {
    if (!editingPlan) return;
    const { activities, ...planWithoutActivities } = planData;
    await updateTravelPlan(editingPlan.id, planWithoutActivities);
    setPlans(plans.map(p => p.id === editingPlan.id ? { ...planData, id: editingPlan.id } : p));
    setEditingPlan(null);
    setViewMode('list');
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('この旅行プランを削除しますか？')) {
      await deleteTravelPlan(planId);
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