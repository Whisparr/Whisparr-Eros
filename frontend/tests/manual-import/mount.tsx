import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ImportMovie from 'AddMovie/ImportMovie/Import/ImportMovie';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import { setTranslations } from 'Utilities/String/translate';
import translationsJson from '../../../src/NzbDrone.Core/Localization/Core/en.json?raw';
import lightTheme from '../../src/Styles/Themes/light';

import 'Components/Form/FormInputGroup';

const translations = JSON.parse(translationsJson) as Record<string, string>;

Object.entries(lightTheme).forEach(([key, value]) =>
  document.documentElement.style.setProperty(`--${key}`, value)
);

function closeModal() {
  document.title = 'closed';
}

setTranslations(translations);
const client = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={client}>
    <BrowserRouter>
      <Routes>
        <Route
          path="/add/import/scenes/:rootFolderId"
          element={
            <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
              <ImportMovie itemType="scene" />
            </div>
          }
        />
        <Route
          path="/queue-import"
          element={
            <InteractiveImportModal
              isOpen={true}
              downloadIds={['first', 'second']}
              onModalClose={closeModal}
            />
          }
        />
        <Route
          path="*"
          element={
            <InteractiveImportModal
              isOpen={true}
              folder="/fixture"
              showDelete={true}
              showFilterExistingFiles={true}
              onModalClose={closeModal}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
