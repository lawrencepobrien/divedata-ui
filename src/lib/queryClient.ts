import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Treat data as fresh for 30s before a background refetch is considered.
      staleTime: 30_000,
      // Don't retry 4xx (auth/validation) — a retry won't fix a bad token or
      // a 404. Retry genuine server/network errors a couple of times.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
