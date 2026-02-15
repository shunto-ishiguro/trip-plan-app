import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

export function useFocusData<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps passed from caller
  }, deps);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refetch();
    }, [refetch]),
  );

  return { data, loading, refetch, setData };
}
