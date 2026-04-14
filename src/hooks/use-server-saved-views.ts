"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type ServerSavedViewState = {
  search: string;
  status: string;
  filtersJson?: string | null;
  sortJson?: string | null;
};

export type ServerSavedViewRecord = {
  id: string;
  name: string;
  scope: string;
  search: string | null;
  status: string | null;
  filtersJson: string | null;
  sortJson: string | null;
};

async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function useServerSavedViews(scope: string, currentState: ServerSavedViewState) {
  const [views, setViews] = useState<ServerSavedViewRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!scope) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/saved-views?scope=${encodeURIComponent(scope)}`, {
        cache: "no-store",
      });
      const json = await readJsonSafe(res);
      setViews(Array.isArray(json?.items) ? json.items : []);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const createView = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const res = await fetch("/api/saved-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          name: trimmed,
          search: currentState.search,
          status: currentState.status,
          filtersJson: currentState.filtersJson || null,
          sortJson: currentState.sortJson || null,
        }),
      });

      if (res.ok) await load();
      return res.ok;
    },
    [scope, currentState, load]
  );

  const deleteView = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/saved-views/${id}`, {
        method: "DELETE",
      });

      if (res.ok) await load();
      return res.ok;
    },
    [load]
  );

  const replaceView = useCallback(
    async (id: string, name?: string) => {
      const res = await fetch(`/api/saved-views/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          search: currentState.search,
          status: currentState.status,
          filtersJson: currentState.filtersJson || null,
          sortJson: currentState.sortJson || null,
        }),
      });

      if (res.ok) await load();
      return res.ok;
    },
    [currentState, load]
  );

  return useMemo(
    () => ({
      views,
      loading,
      reload: load,
      createView,
      deleteView,
      replaceView,
    }),
    [views, loading, load, createView, deleteView, replaceView]
  );
}
