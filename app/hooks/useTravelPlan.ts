"use client";
import { useState } from 'react';
import { TravelPlan, Activity, ViewMode } from '../types/travel';

export function useTravelPlan() {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPlan, setEditingPlan] = useState<TravelPlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([
    // サンプルデータ
    {
      id: '1',
      user_id: 'aaa',
      title: '京都の紅葉旅行',
      destination: '京都府京都市',
      startDate: new Date('2024-11-15'),
      endDate: new Date('2024-11-17'),
      description: '秋の京都で美しい紅葉を楽しむ3日間の旅行',
      imageUrl: 'https://images.unsplash.com/photo-1729864881494-d96345092845?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlfGVufDF8fHx8MTc1Njk5NTk3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      budget: 80000,
      currency: 'JPY',
      activities: [
        {
          id: 'a1',
          plan_id: 'aaa',
          title: '清水寺見学',
          description: '有名な清水の舞台からの景色を楽しむ',
          date: new Date('2024-11-15'),
          time: '10:00',
          location: '京都市東山区',
          cost: 400,
          completed: false,
          category: 'sightseeing'
        },
        {
          id: 'a2',
          plan_id: 'aaa',
          title: '湯豆腐ランチ',
          description: '嵐山の有名店で湯豆腐を味わう',
          date: new Date('2024-11-15'),
          time: '12:30',
          location: '京都市右京区嵐山',
          cost: 2500,
          completed: false,
          category: 'restaurant'
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]);

  const handleCreatePlan = (planData: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlan: TravelPlan = {
      ...planData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPlans([...plans, newPlan]);
    setViewMode('list');
  };

  const handleUpdatePlan = (planData: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPlan) return;

    const updatedPlan: TravelPlan = {
      ...planData,
      id: editingPlan.id,
      createdAt: editingPlan.createdAt,
      updatedAt: new Date()
    };

    setPlans(plans.map(plan => plan.id === editingPlan.id ? updatedPlan : plan));
    setEditingPlan(null);
    setViewMode('list');
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('この旅行プランを削除しますか？')) {
      setPlans(plans.filter(plan => plan.id !== planId));
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

  const handleUpdateActivities = (planId: string, activities: Activity[]) => {
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