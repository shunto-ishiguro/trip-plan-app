"use client";

import { useState, useEffect } from 'react';
import { TravelPlan } from '../types/travel';
import { getTravelPlans } from '../../lib/api'; // 先ほど作った関数

export default function TestPage() {
    const [plans, setPlans] = useState<TravelPlan[]>([]);

    useEffect(() => {
        async function fetchPlans() {
            const data = await getTravelPlans();
            setPlans(data);
        }
        fetchPlans();
    }, []);

    return (
        <div>
            <h1>テストページ</h1>
            {plans.length === 0 ? (
                <p>データがありません</p>
            ) : (
                <ul>
                    {plans.map(plan => (
                        <li key={plan.id}>
                            {plan.title} ({plan.destination})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
