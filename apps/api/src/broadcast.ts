import type { Server } from 'bun';

let _server: Server<unknown> | null = null;

export function setServer(server: Server<unknown>) {
  _server = server;
}

export interface BroadcastEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: unknown;
}

export function broadcast(tripId: string, event: BroadcastEvent) {
  _server?.publish(`trip:${tripId}`, JSON.stringify(event));
}
