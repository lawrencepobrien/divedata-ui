import { useState, useEffect } from 'react';
import { diversApi } from '../api/diver';
import { Diver } from '../types/diver';

export function useDiver(id: number) {
  const [diver, setDiver] = useState<Diver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    diversApi.getById(id)
      .then(setDiver)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { diver, loading, error };
}