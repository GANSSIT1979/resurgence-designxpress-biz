'use client';

import { useCallback, useMemo, useState } from 'react';

type CommentsModalState<T> = {
  isOpen: boolean;
  activePost: T | null;
};

export function useCommentsModal<T>() {
  const [state, setState] = useState<CommentsModalState<T>>({
    isOpen: false,
    activePost: null,
  });

  const openComments = useCallback((post: T) => {
    setState({
      isOpen: true,
      activePost: post,
    });
  }, []);

  const closeComments = useCallback(() => {
    setState({
      isOpen: false,
      activePost: null,
    });
  }, []);

  return useMemo(
    () => ({
      isOpen: state.isOpen,
      activePost: state.activePost,
      openComments,
      closeComments,
    }),
    [closeComments, openComments, state.activePost, state.isOpen],
  );
}
