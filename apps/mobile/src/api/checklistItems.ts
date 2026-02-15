import type { ChecklistItem } from '../types';
import { apiFetch } from './fetcher';

export function getChecklistItems(tripId: string) {
  return apiFetch<ChecklistItem[]>(`/trips/${tripId}/checklist-items`);
}

export function batchCreateChecklistItems(
  tripId: string,
  items: { type: 'packing' | 'todo'; text: string }[],
) {
  return apiFetch<ChecklistItem[]>(`/trips/${tripId}/checklist-items/batch`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export function toggleChecklistItem(tripId: string, itemId: string) {
  return apiFetch<ChecklistItem>(`/trips/${tripId}/checklist-items/${itemId}/toggle`, {
    method: 'PATCH',
  });
}

export function deleteChecklistItem(tripId: string, itemId: string) {
  return apiFetch<void>(`/trips/${tripId}/checklist-items/${itemId}`, {
    method: 'DELETE',
  });
}
