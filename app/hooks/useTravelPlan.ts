"use client";
import { useState, useEffect } from 'react';
import { TravelPlan, Activity, ViewMode } from '../types/travel';
import { getUserId } from '@/lib/api/appUsersApi';
import { addTravelPlanAPI, deleteTravelPlanAPI, getTravelPlanAPI, updateTravelPlanAPI } from '@/lib/api/travelPlansApi';

export function useTravelPlan() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPlan, setEditingPlan] = useState<TravelPlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([]);

  //カスタムフック内での非同期処理はuseEffectに書き込まないとだめよ
  //Reactは同期処理に重きを置いているから、非同期処理は分離しないとだめらしい
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
      }
      catch (e) {
        console.error('ユーザー情報取得に失敗:', e);
      }
    }

    fetchUser();

  }, []);

  useEffect(() => {
    if (!userId) return;
    const getPlan = async () => {
      try {
        console.log(userId);
        const travelPlans = await getTravelPlanAPI(userId); // ここで既に TravelPlan[]
        setPlans(travelPlans);
      }
      catch (e) {
        console.error(e);
      }
    }

    getPlan();

  }, [userId]);

  const handleCreatePlan = async (planData: Omit<TravelPlan, 'user_id' | 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!userId) throw new Error('userIdがnullです');

      // activities を分離
      const { activities, ...travelPlanWithoutActivities } = planData;

      // API 呼び出し
      const newPlan = await addTravelPlanAPI({ ...travelPlanWithoutActivities, user_id: userId });

      if (!newPlan) throw new Error('新規プランの作成に失敗しました');

      // activities をマージして完全な TravelPlan を作る
      const completePlan: TravelPlan = { ...newPlan, activities };

      setPlans([...plans, completePlan]);
      setViewMode('list');
    } catch (error) {
      console.error('handleCreatePlan エラー:', error);
    }
  };

  const handleUpdatePlan = async (planData: Omit<TravelPlan, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPlan) return;

    // activities を退避
    const { activities, ...planWithoutActivities } = planData;

    // API 呼び出し
    const updated = await updateTravelPlanAPI(editingPlan.id, { ...planWithoutActivities, user_id: editingPlan.user_id });

    if (updated) {
      // activities を再マージして UI 側の TravelPlan を更新
      const completePlan: TravelPlan = { ...updated, activities };

      setPlans(plans.map(plan => plan.id === editingPlan.id ? completePlan : plan));
      setEditingPlan(null);
      setViewMode('list');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('この旅行プランを削除しますか？')) {
      await deleteTravelPlanAPI(planId);
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