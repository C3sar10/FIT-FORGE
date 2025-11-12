import { useState, useCallback } from "react";
import { http } from "@/lib/api";

interface UseLoadMoreOptions {
  endpoint: string;
  limit: number;
  initialData?: any;
}

interface LoadMoreState<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  nextCursor: string | null;
}

export function useLoadMore<T>({
  endpoint,
  limit,
  initialData,
}: UseLoadMoreOptions) {
  const [state, setState] = useState<LoadMoreState<T>>({
    items: initialData?.items || [],
    hasMore: !!initialData?.pagination?.nextCursor,
    isLoading: false,
    nextCursor: initialData?.pagination?.nextCursor || null,
  });

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading || !state.nextCursor) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const url = `${endpoint}${
        endpoint.includes("?") ? "&" : "?"
      }limit=${limit}&cursor=${state.nextCursor}`;
      const response = await http.get(url);

      if (response.items && response.items.length > 0) {
        setState((prev) => ({
          ...prev,
          items: [...prev.items, ...response.items],
          nextCursor: response.pagination?.nextCursor || null,
          hasMore: !!response.pagination?.nextCursor,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          hasMore: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Failed to load more items:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [endpoint, limit, state.nextCursor, state.hasMore, state.isLoading]);

  const reset = useCallback((newData?: any) => {
    setState({
      items: newData?.items || [],
      hasMore: !!newData?.pagination?.nextCursor,
      isLoading: false,
      nextCursor: newData?.pagination?.nextCursor || null,
    });
  }, []);

  return {
    ...state,
    loadMore,
    reset,
  };
}
