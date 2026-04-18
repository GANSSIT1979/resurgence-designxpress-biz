"use client";

import { useEffect, useMemo, useState } from "react";

export type SavedViewState = {
  search: string;
  status: string;
};

export type SavedViewRecord = {
  id: string;
  name: string;
  state: SavedViewState;
};

function storageKey(scope: string) {
  return `resurgence_saved_views:${scope}`;
}

export function useSavedViews(scope: string, currentState: SavedViewState) {
  const [views, setViews] = useState<SavedViewRecord[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(scope));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setViews(parsed);
      }
    } catch {
      setViews([]);
    }
  }, [scope]);

  const persist = (nextViews: SavedViewRecord[]) => {
    setViews(nextViews);
    try {
      window.localStorage.setItem(storageKey(scope), JSON.stringify(nextViews));
    } catch {
      // ignore storage errors
    }
  };

  const createView = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const record: SavedViewRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      state: currentState,
    };

    persist([record, ...views]);
  };

  const deleteView = (id: string) => {
    persist(views.filter((item) => item.id !== id));
  };

  const replaceView = (id: string) => {
    persist(
      views.map((item) =>
        item.id === id
          ? {
              ...item,
              state: currentState,
            }
          : item
      )
    );
  };

  return useMemo(
    () => ({
      views,
      createView,
      deleteView,
      replaceView,
    }),
    [views]
  );
}
