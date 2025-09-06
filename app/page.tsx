"use client";

import { useState } from 'react';
import { TravelPlan, Activity } from './types/travel';
import { TravelPlanCard } from './components/TravelPlanCard';
import { TravelPlanForm } from './components/TravelPlanForm';
import { TravelPlanDetail } from './components/TravelPlanDetail';
import { Button } from './components/ui/button';
import { Plus, MapPin } from 'lucide-react';

type ViewMode = 'list' | 'form' | 'detail';

export default function App() {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h1>旅行計画アプリ</h1>
            </div>
            {viewMode === 'list' && (
              <Button onClick={() => setViewMode('form')}>
                <Plus className="h-4 w-4 mr-2" />
                新しい旅行プラン
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {viewMode === 'list' && (
          <div>
            {plans.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="mb-4">まだ旅行プランがありません</h2>
                <p className="text-muted-foreground mb-6">
                  新しい旅行プランを作成して、素敵な旅行の計画を立てましょう。
                </p>
                <Button onClick={() => setViewMode('form')}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初の旅行プランを作成
                </Button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2>旅行プラン一覧</h2>
                  <p className="text-muted-foreground">
                    {plans.length}件の旅行プランがあります
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <TravelPlanCard
                      key={plan.id}
                      plan={plan}
                      onView={handleViewPlan}
                      onEdit={handleEditPlan}
                      onDelete={handleDeletePlan}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'form' && (
          <TravelPlanForm
            plan={editingPlan || undefined}
            onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
            onCancel={() => {
              setViewMode('list');
              setEditingPlan(null);
            }}
          />
        )}

        {viewMode === 'detail' && selectedPlan && (
          <TravelPlanDetail
            plan={selectedPlan}
            onBack={() => setViewMode('list')}
            onEdit={() => handleEditPlan(selectedPlan.id)}
            onUpdateActivities={(activities) => handleUpdateActivities(selectedPlan.id, activities)}
          />
        )}
      </main>
    </div>
  );
}