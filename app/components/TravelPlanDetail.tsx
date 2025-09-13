//app/componetnts/TravelPlanDetail.tsx

import { TravelPlan, Activity, ActivityCategory } from '../types/travel';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import {
    Calendar,
    MapPin,
    DollarSign,
    Plus,
    Edit,
    Trash2,
    Clock,
    ArrowLeft
} from 'lucide-react';
import { ImageWithFallback } from './image/ImageWithFallback';
import { useActivity } from '../hooks/useActivity';

interface TravelPlanDetailProps {
    plan: TravelPlan;
    onBack: () => void;
    onEdit: () => void;
    onUpdateActivities: (activities: Activity[]) => void;
}

const categoryLabels: Record<ActivityCategory, string> = {
    sightseeing: '観光',
    restaurant: '食事',
    accommodation: '宿泊',
    transportation: '交通',
    shopping: 'ショッピング',
    entertainment: 'エンターテイメント',
    other: 'その他'
};

const categoryColors: Record<ActivityCategory, string> = {
    sightseeing: 'bg-blue-100 text-blue-800',
    restaurant: 'bg-orange-100 text-orange-800',
    accommodation: 'bg-purple-100 text-purple-800',
    transportation: 'bg-green-100 text-green-800',
    shopping: 'bg-pink-100 text-pink-800',
    entertainment: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800'
};

export function TravelPlanDetail({ plan, onBack, onEdit, onUpdateActivities }: TravelPlanDetailProps) {

    const {
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
    } = useActivity(plan, onUpdateActivities);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    戻る
                </Button>
                <div className="flex-1" />
                <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                </Button>
            </div>

            {/* Plan Info */}
            <Card>
                <div className="relative h-64 overflow-hidden rounded-t-lg">
                    <ImageWithFallback
                        src={plan.imageUrl || "https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGJlYXV0aWZ1bCUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NTY5NDAxMjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
                        alt={plan.destination}
                        className="w-full h-full object-cover"
                    />
                </div>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div>
                            <h1 className="mb-2">{plan.title}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{plan.destination}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{getDaysCount()}日間</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>{plan.budget.toLocaleString()} {plan.currency}</span>
                            </div>
                        </div>

                        {plan.description && (
                            <p className="text-muted-foreground">{plan.description}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Activities */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>アクティビティ</CardTitle>
                        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    追加
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>新しいアクティビティ</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="activity-title">タイトル</Label>
                                        <Input
                                            id="activity-title"
                                            value={newActivity.title}
                                            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                            placeholder="例: 清水寺見学"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="activity-category">カテゴリ</Label>
                                        <Select
                                            value={newActivity.category}
                                            onValueChange={(value) => setNewActivity({ ...newActivity, category: value as ActivityCategory })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(categoryLabels).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="activity-date">日付</Label>
                                            <Input
                                                id="activity-date"
                                                type="date"
                                                value={newActivity.date?.toISOString().split('T')[0]}
                                                onChange={(e) => setNewActivity({ ...newActivity, date: new Date(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="activity-time">時間</Label>
                                            <Input
                                                id="activity-time"
                                                type="time"
                                                value={newActivity.time}
                                                onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="activity-location">場所</Label>
                                        <Input
                                            id="activity-location"
                                            value={newActivity.location}
                                            onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                                            placeholder="例: 京都市東山区"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="activity-cost">費用</Label>
                                        <Input
                                            id="activity-cost"
                                            type="number"
                                            value={newActivity.cost}
                                            onChange={(e) => setNewActivity({ ...newActivity, cost: Number(e.target.value) })}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="activity-description">説明</Label>
                                        <Textarea
                                            id="activity-description"
                                            value={newActivity.description}
                                            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                            placeholder="詳細な説明..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button onClick={addActivity} className="flex-1">追加</Button>
                                        <Button variant="outline" onClick={() => setIsAddingActivity(false)}>
                                            キャンセル
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {Object.keys(groupedActivities).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            まだアクティビティが登録されていません。
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedActivities)
                                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                                .map(([dateKey, dayActivities]) => (
                                    <div key={dateKey} className="space-y-3">
                                        <h4 className="border-b pb-2">
                                            {formatDate(new Date(dateKey))}
                                        </h4>
                                        <div className="space-y-2">
                                            {dayActivities
                                                .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                                                .map((activity) => (
                                                    <div
                                                        key={activity.id}
                                                        className={`p-4 border rounded-lg ${activity.completed ? 'bg-muted/50' : 'bg-background'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <Checkbox
                                                                    checked={activity.completed}
                                                                    onCheckedChange={() => toggleActivityComplete(activity.id)}
                                                                />
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={`font-medium ${activity.completed ? 'line-through text-muted-foreground' : ''
                                                                                }`}
                                                                        >
                                                                            {activity.title}
                                                                        </span>
                                                                        <Badge className={categoryColors[activity.category]}>
                                                                            {categoryLabels[activity.category]}
                                                                        </Badge>
                                                                    </div>

                                                                    <div className="flex gap-4 text-muted-foreground">
                                                                        {activity.time && (
                                                                            <div className="flex items-center gap-1">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>{activity.time}</span>
                                                                            </div>
                                                                        )}
                                                                        {activity.location && (
                                                                            <div className="flex items-center gap-1">
                                                                                <MapPin className="h-3 w-3" />
                                                                                <span>{activity.location}</span>
                                                                            </div>
                                                                        )}
                                                                        {activity.cost && activity.cost > 0 && (
                                                                            <div className="flex items-center gap-1">
                                                                                <DollarSign className="h-3 w-3" />
                                                                                <span>{activity.cost.toLocaleString()}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {activity.description && (
                                                                        <p className="text-muted-foreground">{activity.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => deleteActivity(activity.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {activities.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                            <div className="flex justify-between">
                                <span>合計費用:</span>
                                <span>{getTotalCost().toLocaleString()} {plan.currency}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>予算残高:</span>
                                <span>{(plan.budget - getTotalCost()).toLocaleString()} {plan.currency}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}