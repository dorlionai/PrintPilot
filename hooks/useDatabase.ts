import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDBOptions {
  cacheMs?: number; // Gemini önerisi: önbellekleme
}

export function useDatabase<T>(fetcher: () => T[], deps: any[] = [], options: UseDBOptions = {}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetch = useRef<number>(0);
  const cacheMs = options.cacheMs ?? 0;

  const load = useCallback((force = false) => {
    // Gemini önerisi: önbellek kontrolü — gereksiz DB sorgularını azalt
    const now = Date.now();
    if (!force && cacheMs > 0 && (now - lastFetch.current) < cacheMs) return;
    
    try {
      setLoading(true);
      const result = fetcher();
      setData(result);
      setError(null);
      lastFetch.current = now;
    } catch (e: any) {
      // Sentry-Bot önerisi: Hata tipi kontrolü
      const msg = e?.message || 'Bilinmeyen veritabanı hatası';
      setError(msg);
      console.error('[useDatabase]', msg);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { load(true); }, [load]);

  return { data, loading, error, reload: () => load(true) };
}