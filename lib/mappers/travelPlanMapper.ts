import { DBTravelPlan, TravelPlan } from '../../app/types/travel';

//TravelPlan型からデータベースのテーブルに寄せたDBPlan型に変更する
export function toDBTravelPlan(plan: Omit<TravelPlan, 'id' | 'activities'>): DBTravelPlan {
    return {
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

export function toTravelPlan(plan: DBTravelPlan): Omit<TravelPlan, 'activities'> | null {
    if (plan.id && plan.created_at && plan.updated_at) {
        return {
            id: plan.id,
            title: plan.title,
            destination: plan.destination,
            startDate: new Date(plan.start_date),
            endDate: new Date(plan.end_date),
            description: plan.description,
            imageUrl: plan.image_url,
            budget: plan.budget,
            currency: plan.currency,
        };
    }
    else {
        console.error("toTravelPlanでDBplanが一部nullです");
        return null;
    }
}