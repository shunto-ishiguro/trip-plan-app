import type { JoinResult, ShareSettings, TripPreview } from '../types';
import { apiFetch } from './fetcher';

export function getShareSettings(tripId: string) {
  return apiFetch<ShareSettings>(`/trips/${tripId}/share`);
}

export function createShareSettings(tripId: string, permission: 'view' | 'edit') {
  return apiFetch<ShareSettings>(`/trips/${tripId}/share`, {
    method: 'POST',
    body: JSON.stringify({ permission }),
  });
}

export function updateShareSettings(
  tripId: string,
  body: { permission?: 'view' | 'edit'; isActive?: boolean },
) {
  return apiFetch<ShareSettings>(`/trips/${tripId}/share`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteShareSettings(tripId: string) {
  return apiFetch<void>(`/trips/${tripId}/share`, {
    method: 'DELETE',
  });
}

export function previewTrip(passphrase: string) {
  return apiFetch<TripPreview>(`/share/preview/${passphrase}`);
}

export function joinTrip(passphrase: string) {
  return apiFetch<JoinResult>('/share/join', {
    method: 'POST',
    body: JSON.stringify({ token: passphrase }),
  });
}
