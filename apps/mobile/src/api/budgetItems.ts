import type { BudgetItem } from '../types';
import { apiFetch } from './fetcher';

export function getBudgetItems(tripId: string) {
  return apiFetch<BudgetItem[]>(`/trips/${tripId}/budget-items`);
}

export function createBudgetItem(
  tripId: string,
  body: {
    category: BudgetItem['category'];
    name: string;
    amount: number;
    pricingType: BudgetItem['pricingType'];
    memo?: string | null;
  },
) {
  return apiFetch<BudgetItem>(`/trips/${tripId}/budget-items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteBudgetItem(tripId: string, itemId: string) {
  return apiFetch<void>(`/trips/${tripId}/budget-items/${itemId}`, {
    method: 'DELETE',
  });
}
