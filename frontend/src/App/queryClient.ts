import { QueryClient } from '@tanstack/react-query';

// Freshness in this app is push-driven: SignalRListener invalidates a dozen query
// families as the server changes them. React Query's default staleTime of 0 layers a
// poll on top of that -- every component that mounts a new observer refetches data
// nothing has touched. A minute of staleness costs nothing here because
// refetchOnWindowFocus stays on, so returning to the tab still catches everything up.
//
// Queries that need something else say so locally: config-shaped data that only this
// app mutates uses Infinity, and genuinely poll-worthy data (backups) sets its own.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      // Three retries with backoff is a slow way to surface a failure from a server
      // that is usually on the same machine.
      retry: 1,
    },
  },
});

// This code is only for TypeScript
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/react-query').QueryClient;
  }
}

// This code is for all users
// eslint-disable-next-line no-underscore-dangle
window.__TANSTACK_QUERY_CLIENT__ = queryClient;
