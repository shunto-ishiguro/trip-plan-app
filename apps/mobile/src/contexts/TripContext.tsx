import { useFocusEffect } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import * as tripsApi from '../api/trips';
import type { Trip } from '../types';

interface TripContextValue {
  trip: Trip | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ tripId, children }: { tripId: string; children: ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const data = await tripsApi.getTrip(tripId);
      setTrip(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return <TripContext.Provider value={{ trip, loading, refetch }}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside TripProvider');
  return ctx;
}
