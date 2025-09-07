import { TravelPlan } from '../types/travel';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './image/ImageWithFallback';

interface TravelPlanCardProps {
    plan: TravelPlan;
    onView: (planId: string) => void;
    onEdit: (planId: string) => void;
    onDelete: (planId: string) => void;
}

export function TravelPlanCard({ plan, onView, onEdit, onDelete }: TravelPlanCardProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const getDaysCount = () => {
        if (!plan.startDate || !plan.endDate) return 0;
        const timeDiff = plan.endDate.getTime() - plan.startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                    src={plan.imageUrl || "https://images.unsplash.com/photo-1646303297330-17073f7823c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBwbGFubmluZyUyMG1hcHxlbnwxfHx8fDE3NTY5OTU5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
                    alt={plan.destination}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                        {getDaysCount()}日間
                    </Badge>
                </div>
            </div>

            <CardHeader>
                <div className="space-y-2">
                    <h3 className="truncate">{plan.title}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{plan.destination}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{plan.budget.toLocaleString()} {plan.currency}</span>
                </div>

                {plan.description && (
                    <p className="text-muted-foreground line-clamp-2">
                        {plan.description}
                    </p>
                )}
            </CardContent>

            <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(plan.id)} className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    詳細
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(plan.id)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(plan.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}