import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Page from 'Components/Page/Page';
import ApplyTheme from './ApplyTheme';
import AppRoutes from './AppRoutes';
import { queryClient } from './queryClient';

function AppContent() {
  return (
    <>
      <ApplyTheme />
      <Page>
        <AppRoutes />
      </Page>
    </>
  );
}

function App() {
  const router = createBrowserRouter([{ path: '*', element: <AppContent /> }], {
    basename: globalThis.Whisparr.urlBase || '/',
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
