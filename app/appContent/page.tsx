//app/appContent/page.tsx

"use client";

import { TravelPlanCard } from './../components/TravelPlanCard';
import { TravelPlanForm } from './../components/TravelPlanForm';
import { TravelPlanDetail } from './../components/TravelPlanDetail';
import { Button } from './../components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { useTravelPlan } from './../hooks/useTravelPlan';

export default function AppContent() {

    const { viewMode, setViewMode,
        editingPlan, setEditingPlan,
        selectedPlan, setSelectedPlanId,
        plans, setPlans,
        handleCreatePlan,
        handleDeletePlan,
        handleEditPlan,
        handleUpdateActivities,
        handleUpdatePlan,
        handleViewPlan } = useTravelPlan();

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