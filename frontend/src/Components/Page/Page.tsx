import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { saveDimensions, useAppDimension, useAppValues } from 'App/appStore';
import AppUpdatedModal from 'App/AppUpdatedModal';
import ColorImpairedContext from 'App/ColorImpairedContext';
import ConnectionLostModal from 'App/ConnectionLostModal';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import SignalRListener from 'Components/SignalRListener';
import AuthenticationRequiredModal from 'FirstRun/AuthenticationRequiredModal';
import useAppPage from 'Helpers/Hooks/useAppPage';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import { useSystemStatusData } from 'System/Status/useSystemStatus';
import ErrorPage from './ErrorPage';
import PageHeader from './Header/PageHeader';
import LoadingPage from './LoadingPage';
import PageSidebar from './Sidebar/PageSidebar';
import styles from './Page.css';

interface PageProps {
  children: React.ReactNode;
}

function Page({ children }: Readonly<PageProps>) {
  const { hasError, errors, isPopulated, isLocalStorageSupported } =
    useAppPage();
  const [isUpdatedModalOpen, setIsUpdatedModalOpen] = useState(false);
  const [isConnectionLostModalOpen, setIsConnectionLostModalOpen] =
    useState(false);

  const safeForWorkMode = useSafeForWorkMode();
  const { enableColorImpairedMode } = useSelector(createUISettingsSelector());
  const isSmallScreen = useAppDimension('isSmallScreen');
  const { authentication } = useSystemStatusData();
  const authenticationEnabled = authentication !== 'none';
  const { isSidebarVisible, isUpdated, isDisconnected, version } = useAppValues(
    'isSidebarVisible',
    'isUpdated',
    'isDisconnected',
    'version'
  );

  const handleUpdatedModalClose = useCallback(() => {
    setIsUpdatedModalOpen(false);
  }, []);

  const handleResize = useCallback(() => {
    saveDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (isDisconnected) {
      setIsConnectionLostModalOpen(true);
    }
  }, [isDisconnected]);

  useEffect(() => {
    if (isUpdated) {
      setIsUpdatedModalOpen(true);
    }
  }, [isUpdated]);

  if (hasError || !isLocalStorageSupported) {
    return (
      <ErrorPage
        {...errors}
        version={version}
        isLocalStorageSupported={isLocalStorageSupported}
      />
    );
  }

  if (!isPopulated) {
    return <LoadingPage />;
  }

  return (
    <SafeForWorkModeContext.Provider value={safeForWorkMode}>
      <ColorImpairedContext.Provider value={enableColorImpairedMode}>
        <div className={styles.page}>
          <SignalRListener />

          <PageHeader isSmallScreen={isSmallScreen} />

          <div className={styles.main}>
            <PageSidebar
              isSmallScreen={isSmallScreen}
              isSidebarVisible={!!isSidebarVisible}
            />

            {children}
          </div>

          <AppUpdatedModal
            isOpen={isUpdatedModalOpen}
            onModalClose={handleUpdatedModalClose}
          />

          <ConnectionLostModal isOpen={isConnectionLostModalOpen} />

          <AuthenticationRequiredModal isOpen={!authenticationEnabled} />
        </div>
      </ColorImpairedContext.Provider>
    </SafeForWorkModeContext.Provider>
  );
}

export default Page;
