import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
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
import { icons, kinds, sizes } from 'Helpers/Props';
import {
  addRootFolder,
  fetchRootFolders,
} from 'Store/Actions/rootFolderActions';
import createRootFoldersSelector from 'Store/Selectors/createRootFoldersSelector';
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

interface RootFolder {
  id: number;
  path: string;
  freeSpace: number;
  importFiles: { name: string; path: string; relativePath: string }[];
}

function ImportMovieSelectFolder() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const rootFoldersState = useSelector(
    createRootFoldersSelector()
  ) as unknown as {
    isFetching: boolean;
    isPopulated: boolean;
    isSaving: boolean;
    error: Error | null;
    saveError: { statusBody?: { errorMessage?: string }[] } | null;
    items: RootFolder[];
  };

  const { isFetching, isPopulated, isSaving, error, saveError, items } =
    rootFoldersState;

  const [isAddNewRootFolderModalOpen, setIsAddNewRootFolderModalOpen] =
    useState(false);

  // Track items length to detect when a new root folder has been added
  const prevItemsRef = useRef<RootFolder[]>([]);
  const prevIsSavingRef = useRef(false);

  const isMovies = location.pathname === '/add/import/movies';
  const importTitle = isMovies ? 'ImportMovies' : 'ImportScenes';
  const hasRootFolders = items.length > 0;

  useEffect(() => {
    dispatch(fetchRootFolders());
  }, [dispatch]);

  // After a save completes without error, navigate to the new folder's import page
  useEffect(() => {
    if (prevIsSavingRef.current && !isSaving && !saveError) {
      const prevIds = new Set(prevItemsRef.current.map((rf) => rf.id));
      const newFolders = items.filter((rf) => !prevIds.has(rf.id));
      if (newFolders.length === 1) {
        history.push(
          `${globalThis.Whisparr.urlBase}/add/import/movies/${newFolders[0].id}`
        );
      }
    }
    prevIsSavingRef.current = isSaving;
    prevItemsRef.current = items;
  }, [history, isSaving, items, saveError]);

  const onAddNewRootFolderPress = useCallback(() => {
    setIsAddNewRootFolderModalOpen(true);
  }, []);

  const onNewRootFolderSelect = useCallback(
    ({ value }: { value: string }) => {
      dispatch(addRootFolder({ path: value }));
      setIsAddNewRootFolderModalOpen(false);
    },
    [dispatch]
  );

  const onAddRootFolderModalClose = useCallback(() => {
    setIsAddNewRootFolderModalOpen(false);
  }, []);

  const saveErrorBody = Array.isArray(saveError?.statusBody)
    ? saveError.statusBody
    : null;

  return (
    <PageContent title={translate(importTitle)}>
      <PageContentBody>
        {isFetching && !isPopulated ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('RootFoldersLoadError')}</Alert>
        ) : null}

        {!error && isPopulated && (
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
                <li className={styles.tip}>{translate('ImportStep5')}</li>
              </ul>
            </div>

            {hasRootFolders ? (
              <div className={styles.recentFolders}>
                <FieldSet legend={translate('RecentFolders')}>
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
            ) : null}

            {!isSaving && saveError ? (
              <Alert className={styles.addErrorAlert} kind={kinds.DANGER}>
                {translate('AddRootFolderError')}

                <ul>
                  {saveErrorBody ? (
                    saveErrorBody.map((e) => (
                      <li key={e.errorMessage}>{e.errorMessage}</li>
                    ))
                  ) : (
                    <li>{JSON.stringify(saveError)}</li>
                  )}
                </ul>
              </Alert>
            ) : null}

            <div className={hasRootFolders ? undefined : styles.startImport}>
              <Button
                kind={kinds.PRIMARY}
                size={sizes.LARGE}
                onPress={onAddNewRootFolderPress}
              >
                <Icon className={styles.importButtonIcon} name={icons.DRIVE} />
                {hasRootFolders
                  ? translate('ChooseAnotherFolder')
                  : translate('StartImport')}
              </Button>
            </div>

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
