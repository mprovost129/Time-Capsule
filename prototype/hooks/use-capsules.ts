'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Capsule } from '@/lib/capsule-types';
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body && typeof init.body === 'string'
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init?.headers,
    },
  });
  const data = (await response.json()) as { error?: string };
  if (!response.ok)
    throw new Error(data.error || 'Unable to complete that request.');
  return data as T;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function useCapsules(example: Capsule) {
  const [draft, setDraft] = useState(example),
    [library, setLibrary] = useState<Capsule[]>([]),
    [ready, setReady] = useState(false),
    [signedIn, setSignedIn] = useState(false),
    [status, setStatus] = useState('Loading saved drafts…'),
    [error, setError] = useState('');
  const current = useRef(example),
    dirty = useRef(false),
    sequence = useRef(0),
    saving = useRef<Promise<void> | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    mounted = useRef(true);
  const setCurrent = useCallback((value: Capsule) => {
    current.current = value;
    setDraft(value);
  }, []);
  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (saving.current) return saving.current;
    if (!dirty.current) return;
    const run = async () => {
      try {
        setError('');
        while (dirty.current) {
          setStatus('Saving…');
          const snapshot = current.current;
          const version = sequence.current;
          const { capsule } = await api<{ capsule: Capsule }>('/api/capsules', {
            method: 'PUT',
            body: JSON.stringify(snapshot),
          });
          if (!mounted.current) return;
          current.current = {
            ...current.current,
            revision: capsule.revision,
            updatedAt: capsule.updatedAt,
          };
          setDraft(current.current);
          setLibrary((items) => [
            capsule,
            ...items.filter((c) => c.id !== capsule.id),
          ]);
          dirty.current = version !== sequence.current;
        }
        setStatus('Saved to your library');
      } catch (e) {
        if (mounted.current) {
          setError(e instanceof Error ? e.message : 'Unable to save.');
          setStatus('Not saved');
        }
        throw e;
      } finally {
        saving.current = null;
      }
    };
    saving.current = run();
    return saving.current;
  }, []);
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    fetch('/api/capsules')
      .then(async (r) => {
        if (r.status === 401) {
          if (!cancelled) {
            setSignedIn(false);
            setStatus('Enable saved capsules to begin');
          }
          return;
        }
        if (!r.ok)
          throw new Error('Saved drafts could not be loaded. Please retry.');
        const data = (await r.json()) as { capsules: Capsule[] };
        if (!cancelled) {
          setSignedIn(true);
          setLibrary(data.capsules);
          const available = data.capsules.find((c) => !c.deleting);
          if (available) setCurrent(available);
          setStatus('Saved to your library');
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setStatus('Storage unavailable');
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [setCurrent]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current || saving.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  const change = useCallback(
    (patch: Partial<Capsule>) => {
      if (!signedIn || !ready) return;
      const next = { ...current.current, ...patch };
      if (next.id === 'sample') {
        next.id = crypto.randomUUID();
        next.date = today();
        next.revision = 0;
      }
      setCurrent(next);
      dirty.current = true;
      sequence.current++;
      setStatus('Saving…');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void flush().catch(() => {});
      }, 400);
    },
    [signedIn, ready, setCurrent, flush],
  );
  const begin = async () => {
    await flush();
    const next: Capsule = {
      id: crypto.randomUUID(),
      name: '',
      title: '',
      date: today(),
      answers: {},
      coverId: null,
      revision: 0,
      updatedAt: '',
    };
    setCurrent(next);
    dirty.current = true;
    sequence.current++;
    await flush();
  };
  const open = async (id: string) => {
    await flush();
    const result = await api<{ capsules: Capsule[] }>('/api/capsules');
    setLibrary(result.capsules);
    const next = result.capsules.find((c) => c.id === id);
    if (!next || next.deleting)
      throw new Error('That draft is no longer available.');
    setCurrent(next);
    setError('');
    setStatus('Saved to your library');
  };
  const refresh = async () => {
    if (current.current.id === 'sample') return;
    await open(current.current.id);
  };
  const reloadSaved = async () => {
    if (saving.current) await saving.current.catch(() => {});
    const result = await api<{ capsules: Capsule[] }>('/api/capsules');
    const saved = result.capsules.find((c) => c.id === current.current.id);
    if (!saved || saved.deleting)
      throw new Error(
        'No saved version is available. Download this draft before leaving.',
      );
    if (timer.current) clearTimeout(timer.current);
    dirty.current = false;
    setCurrent(saved);
    setLibrary(result.capsules);
    setError('');
    setStatus('Saved version restored');
  };
  const remove = async (id: string) => {
    await flush();
    await api('/api/capsules?id=' + id, { method: 'DELETE' });
    const result = await api<{ capsules: Capsule[] }>('/api/capsules');
    setLibrary(result.capsules);
    setCurrent(result.capsules.find((c) => !c.deleting) || example);
    setStatus('Draft deleted');
  };
  return {
    draft,
    library,
    ready,
    signedIn,
    status,
    error,
    change,
    flush,
    begin,
    open,
    refresh,
    reloadSaved,
    remove,
  };
}
