import { useState } from 'react';
import { TravelPlan } from '../types/travel';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TravelPlanFormProps {
    plan?: TravelPlan;
    onSubmit: (plan: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

export function TravelPlanForm({ plan, onSubmit, onCancel }: TravelPlanFormProps) {
    const [formData, setFormData] = useState({
        title: plan?.title || '',
        destination: plan?.destination || '',
        startDate: plan?.startDate || new Date(),
        endDate: plan?.endDate || new Date(),
        description: plan?.description || '',
        imageUrl: plan?.imageUrl || '',
        budget: plan?.budget || 0,
        currency: plan?.currency || 'JPY',
        activities: plan?.activities || []
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{plan ? '旅行プランを編集' : '新しい旅行プランを作成'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">タイトル</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="例: 京都の紅葉旅行"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="destination">目的地</Label>
                        <Input
                            id="destination"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            placeholder="例: 京都府京都市"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">開始日</Label>
                            {/* Radix UI Calendar をやめてブラウザ標準の input type="date" に変更 */}
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate.toISOString().split('T')[0]}
                                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">終了日</Label>
                            {/* Radix UI Calendar をやめてブラウザ標準の input type="date" に変更 */}
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate.toISOString().split('T')[0]}
                                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="budget">予算</Label>
                            <Input
                                id="budget"
                                type="text"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^d*$/.test(val)) {
                                        setFormData({ ...formData, budget: Number(e.target.value) });
                                    }
                                }}
                                placeholder="100000"
                                min="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">通貨</Label>
                            <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="通貨を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="JPY">円 (JPY)</SelectItem>
                                    <SelectItem value="USD">ドル (USD)</SelectItem>
                                    <SelectItem value="EUR">ユーロ (EUR)</SelectItem>
                                    <SelectItem value="KRW">ウォン (KRW)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">画像URL（オプション）</Label>
                        <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">説明（オプション）</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="旅行の詳細や目的を記入してください..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                            {plan ? '更新' : '作成'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            キャンセル
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}