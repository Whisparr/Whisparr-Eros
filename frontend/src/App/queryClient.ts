import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

// This code is only for TypeScript
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
  }
}

// This code is for all users
// eslint-disable-next-line no-underscore-dangle
window.__TANSTACK_QUERY_CLIENT__ = queryClient;
