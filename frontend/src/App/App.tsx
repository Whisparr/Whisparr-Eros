import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import DocumentTitle from 'react-document-title';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Store } from 'redux';
import Page from 'Components/Page/Page';
import ApplyTheme from './ApplyTheme';
import AppRoutes from './AppRoutes';
import { queryClient } from './queryClient';

interface AppProps {
  store: Store;
}

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

function App({ store }: Readonly<AppProps>) {
  const router = createBrowserRouter([{ path: '*', element: <AppContent /> }], {
    basename: globalThis.Whisparr.urlBase || '/',
  });

  return (
    <DocumentTitle title={globalThis.Whisparr.instanceName}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </QueryClientProvider>
    </DocumentTitle>
  );
}

export default App;
