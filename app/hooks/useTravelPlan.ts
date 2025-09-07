"use client";
import { useState, useEffect } from 'react';
import { TravelPlan, Activity, ViewMode } from '../types/travel';
import { getUserId } from '@/lib/api/appUsersApi';
import { addTravelPlanAPI, deleteTravelPlanAPI, getTravelPlanAPI, updateTravelPlanAPI } from '@/lib/api/travelPlansApi';
import { updateActivity } from '@/lib/api/activitiesApi';

export function useTravelPlan() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPlan, setEditingPlan] = useState<TravelPlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  //カスタムフック内での非同期処理はuseEffectに書き込まないとだめよ
  //Reactは同期処理に重きを置いているから、非同期処理は分離しないとだめらしい
  const [plans, setPlans] = useState<TravelPlan[]>([]);
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

  /*[
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
]*/

  const handleCreatePlan = async (planData: Omit<TravelPlan, 'user_id' | 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!userId) throw new Error('userIdがnullです');

      // activities を分離
      const { activities, ...travelPlanWithoutActivities } = planData;

      // API 呼び出し
      const newPlan = await addTravelPlanAPI({
        ...travelPlanWithoutActivities,
        user_id: userId
      });

      if (!newPlan) throw new Error('新規プランの作成に失敗しました');

      // activities をマージして完全な TravelPlan を作る
      const completePlan: TravelPlan = {
        ...newPlan,
        activities
      };

      setPlans([...plans, completePlan]);
      setViewMode('list');
    } catch (error) {
      console.error('handleCreatePlan エラー:', error);
    }
  };

  const handleUpdatePlan = async (
    planData: Omit<TravelPlan, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingPlan) return;

    // activities を退避
    const { activities, ...planWithoutActivities } = planData;

    // API 呼び出し
    const updated = await updateTravelPlanAPI(editingPlan.id, planWithoutActivities);

    if (updated) {
      // activities を再マージして UI 側の TravelPlan を更新
      const completePlan: TravelPlan = {
        ...updated,
        activities
      };

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