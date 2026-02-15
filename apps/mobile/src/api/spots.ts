import type { Spot } from '../types';
import { apiFetch } from './fetcher';

export function getSpots(tripId: string, dayIndex?: number) {
  const query = dayIndex !== undefined ? `?dayIndex=${dayIndex}` : '';
  return apiFetch<Spot[]>(`/trips/${tripId}/spots${query}`);
}

export function createSpot(
  tripId: string,
  body: {
    dayIndex: number;
    order: number;
    name: string;
    address?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    memo?: string | null;
  },
) {
  return apiFetch<Spot>(`/trips/${tripId}/spots`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteSpot(tripId: string, spotId: string) {
  return apiFetch<void>(`/trips/${tripId}/spots/${spotId}`, {
    method: 'DELETE',
  });
}
