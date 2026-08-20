import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import FileBrowserModal from 'Components/FileBrowser/FileBrowserModal';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { getValidationFailures } from 'Helpers/Hooks/useApiMutation';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { icons, kinds, sizes } from 'Helpers/Props';
import useRootFolders, {
  useAddRootFolder,
  useRefreshRootFolder,
  useSortedRootFolders,
} from 'RootFolder/useRootFolders';
import { fetchNamingSettings } from 'Store/Actions/Settings/naming';
import translate from 'Utilities/String/translate';
import ImportMovieRootFolderRow from './ImportMovieRootFolderRow';
import styles from './ImportMovieSelectFolder.css';

const rootFolderColumns = [
  { name: 'path', label: () => translate('Path'), isVisible: true },
  { name: 'freeSpace', label: () => translate('FreeSpace'), isVisible: true },
  {
    name: 'importFiles',
    label: () => translate('ImportFiles'),
    isVisible: true,
  },
  { name: 'actions', label: () => '', isVisible: true },
];

function ImportMovieSelectFolder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isFetching, isFetched, error } = useRootFolders();
  const items = useSortedRootFolders();

  const {
    addRootFolder,
    isAddingRootFolder,
    addRootFolderError,
    newRootFolder,
  } = useAddRootFolder();

  const { refreshRootFolder } = useRefreshRootFolder();

  const [isAddNewRootFolderModalOpen, setIsAddNewRootFolderModalOpen] =
    useState(false);

  const previousIsAddingRootFolder = usePrevious(isAddingRootFolder);

  const isMovies = location.pathname === '/add/import/movies';
  const importTitle = isMovies ? 'ImportMovies' : 'ImportScenes';
  const hasRootFolders = items.length > 0;

  useEffect(() => {
    dispatch(fetchNamingSettings());
  }, [dispatch]);

  // Refresh all root folders on initial load so importFiles counts are current
  const didInitialRefreshRef = useRef(false);
  useEffect(() => {
    if (isFetched && !didInitialRefreshRef.current) {
      didInitialRefreshRef.current = true;
      items.forEach((rf) => refreshRootFolder({ id: rf.id }));
    }
  }, [isFetched, items, refreshRootFolder]);

  const onAddNewRootFolderPress = useCallback(() => {
    setIsAddNewRootFolderModalOpen(true);
  }, []);

  const onNewRootFolderSelect = useCallback(
    ({ value }: { value: string }) => {
      addRootFolder({ path: value });
      setIsAddNewRootFolderModalOpen(false);
    },
    [addRootFolder]
  );

  const onAddRootFolderModalClose = useCallback(() => {
    setIsAddNewRootFolderModalOpen(false);
  }, []);

  // The mutation hands back the folder it created, so navigating no longer
  // means diffing the list for an id that appeared.
  useEffect(() => {
    if (
      previousIsAddingRootFolder &&
      !isAddingRootFolder &&
      !addRootFolderError &&
      newRootFolder
    ) {
      navigate(`/add/import/movies/${newRootFolder.id}`);
    }
  }, [
    navigate,
    previousIsAddingRootFolder,
    isAddingRootFolder,
    addRootFolderError,
    newRootFolder,
  ]);

  const addFailures = useMemo(
    () => getValidationFailures(addRootFolderError).errors,
    [addRootFolderError]
  );

  return (
    <PageContent title={translate(importTitle)}>
      <PageContentBody>
        {isFetching && !isFetched ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('RootFoldersLoadError')}</Alert>
        ) : null}

        {!error && isFetched && (
          <div>
            {isMovies ? (
              <div className={styles.header}>{translate('ImportHeader')}</div>
            ) : (
              <div className={styles.header}>
                {translate('ImportScenesHeader')}
              </div>
            )}

            <div className={styles.tips}>
              {translate('ImportTipsMessage')}
              <ul>
                <li className={styles.tip}>{translate('ImportStep1')}</li>
                <li className={styles.tip}>{translate('ImportStep2')}</li>
                <li className={styles.tip}>{translate('ImportStep3')}</li>
                <li className={styles.tip}>{translate('ImportStep4')}</li>
              </ul>
            </div>

            {hasRootFolders ? (
              <div className={styles.recentFolders}>
                <FieldSet legend={translate('RootFolders')}>
                  <Table columns={rootFolderColumns}>
                    <TableBody>
                      {items.map((rootFolder) => (
                        <ImportMovieRootFolderRow
                          key={rootFolder.id}
                          id={rootFolder.id}
                          path={rootFolder.path}
                          freeSpace={rootFolder.freeSpace}
                          importFiles={rootFolder.importFiles}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </FieldSet>
              </div>
            ) : (
              <div className={styles.startImport}>
                <Button
                  kind={kinds.PRIMARY}
                  size={sizes.LARGE}
                  onPress={onAddNewRootFolderPress}
                >
                  <Icon
                    className={styles.importButtonIcon}
                    name={icons.DRIVE}
                  />
                  {translate('AddRootFolder')}
                </Button>
              </div>
            )}

            {!isAddingRootFolder && addRootFolderError ? (
              <Alert className={styles.addErrorAlert} kind={kinds.DANGER}>
                {translate('AddRootFolderError')}

                <ul>
                  {addFailures.length ? (
                    addFailures.map((e) => (
                      <li key={e.errorMessage}>{e.errorMessage}</li>
                    ))
                  ) : (
                    <li>{JSON.stringify(addRootFolderError.statusBody)}</li>
                  )}
                </ul>
              </Alert>
            ) : null}

            <FileBrowserModal
              isOpen={isAddNewRootFolderModalOpen}
              name="rootFolderPath"
              value=""
              onChange={onNewRootFolderSelect}
              onModalClose={onAddRootFolderModalClose}
            />
          </div>
        )}
      </PageContentBody>
    </PageContent>
  );
}

export default ImportMovieSelectFolder;
