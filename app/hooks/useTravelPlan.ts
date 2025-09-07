"use client";
import { useState, useEffect } from 'react';
import { TravelPlan, Activity, ViewMode } from '../types/travel';
import { getUserId } from '@/lib/api/appUsersApi';
import { addTravelPlan, deleteTravelPlan, getTravelPlans, updateTravelPlan } from '@/lib/api/travelPlansApi';
import { updateActivity } from '@/lib/api/activitiesApi';
import { DBPlan } from '../types/travel';

//TravelPlan型からデータベースのテーブルに寄せたDBPlan型に変更する
function toDBPlan(plan: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): DBPlan{
  return {
    user_id: plan.user_id,
    title: plan.title,
    destination: plan.destination,
    start_date: plan.startDate.toISOString(),
    end_date: plan.endDate.toISOString(),
    description: plan.description,
    image_url: plan.imageUrl,
    budget: plan.budget,
    currency: plan.currency
  };
}
function toTravelPlan(plan: DBPlan): Omit<TravelPlan,'activities'> | null{
  if(plan.id && plan.created_at && plan.updated_at){
    return {
      id: plan.id,
      user_id: plan.user_id,
      title: plan.title,
      destination: plan.destination,
      startDate: new Date(plan.start_date),
      endDate: new Date(plan.end_date),
      description: plan.description,
      imageUrl: plan.image_url,
      budget: plan.budget,
      currency: plan.currency,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at)
    };
  }
  else{
    console.error("toTravelPlanでDBplanが一部nullです");
    return null;
  }
}

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
        setPlans(await getTravelPlans(userId));
      }
      catch(e) {
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
      const {activities, ...travelPlanWithoutActivities} = planData;
      if(userId){
        const toDB = {...travelPlanWithoutActivities, user_id: userId};
        const newPlan = await addTravelPlan(toDBPlan(toDB));
        if (!newPlan) throw new Error('新規プランの作成に失敗しました');
        const toTravel = toTravelPlan(newPlan);
        if(toTravel){
          if(toTravel.id){
            const newTravelPlan: TravelPlan = {...toTravel, activities: activities};
            setPlans([...plans, newTravelPlan]);
          }
        }
        setViewMode('list');
      }else{
        throw new Error('userIdがnullです');
      }
    } catch (error) {
      console.error('handleCreatePlan エラー:', error);
      // 必要なら UI にエラーメッセージを表示
    }
  };

  const handleUpdatePlan = async (planData: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPlan) return;

    const updatedPlan: TravelPlan = {
      ...planData,
      id: editingPlan.id,
      createdAt: editingPlan.createdAt,
      updatedAt: new Date()
    };
    await updateTravelPlan(editingPlan.id, updatedPlan);
    setPlans(plans.map(plan => plan.id === editingPlan.id ? updatedPlan : plan));
    setEditingPlan(null);
    setViewMode('list');
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('この旅行プランを削除しますか？')) {
      await deleteTravelPlan(planId);
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