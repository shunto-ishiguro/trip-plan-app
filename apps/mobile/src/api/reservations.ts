import type { Reservation } from '../types';
import { apiFetch } from './fetcher';

export function getReservations(tripId: string) {
  return apiFetch<Reservation[]>(`/trips/${tripId}/reservations`);
}

export function createReservation(
  tripId: string,
  body: {
    type: Reservation['type'];
    name: string;
    confirmationNumber?: string | null;
    datetime?: string | null;
    link?: string | null;
    memo?: string | null;
  },
) {
  return apiFetch<Reservation>(`/trips/${tripId}/reservations`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteReservation(tripId: string, reservationId: string) {
  return apiFetch<void>(`/trips/${tripId}/reservations/${reservationId}`, {
    method: 'DELETE',
  });
}
