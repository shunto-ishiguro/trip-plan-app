import type { Trip } from '../types';
import { apiFetch } from './fetcher';

export function getTrips() {
  return apiFetch<Trip[]>('/trips');
}

export function getTrip(tripId: string) {
  return apiFetch<Trip>(`/trips/${tripId}`);
}

export function createTrip(body: {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  memberCount?: number;
  memo?: string | null;
}) {
  return apiFetch<Trip>('/trips', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateTrip(
  tripId: string,
  body: {
    title?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    memberCount?: number;
    memo?: string | null;
  },
) {
  return apiFetch<Trip>(`/trips/${tripId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteTrip(tripId: string) {
  return apiFetch<void>(`/trips/${tripId}`, {
    method: 'DELETE',
  });
}
