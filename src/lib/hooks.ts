import { useState, useEffect, useCallback } from 'react';
import type { Client } from '../types';
import { clients } from './database';

export interface UseCollectionReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  create: (input: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useClients(): UseCollectionReturn<Client> {
  const [data, setData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clients().get();
      setData(result as Client[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const optimistic: Client = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Client;
    setData(prev => [optimistic, ...prev]);
    try {
      await clients().add({ ...input, createdAt: optimistic.createdAt });
      await refresh();
    } catch (err) {
      setData(prev => prev.filter(p => p.id !== optimistic.id));
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<Client>) => {
    const original = data.find(p => p.id === id);
    setData(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await clients().update(id, updates);
    } catch (err) {
      if (original) setData(prev => prev.map(p => p.id === id ? original : p));
      throw err;
    }
  };

  const remove = async (id: string) => {
    const original = data.find(p => p.id === id);
    setData(prev => prev.filter(p => p.id !== id));
    try {
      await clients().delete(id);
    } catch (err) {
      if (original) setData(prev => [...prev, original]);
      throw err;
    }
  };

  return { data, loading, error, create, update, remove, refresh };
}
