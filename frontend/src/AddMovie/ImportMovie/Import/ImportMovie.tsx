import { reduce } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useMatch, useParams } from 'react-router-dom';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { kinds } from 'Helpers/Props';
import { useRootFolder } from 'RootFolder/useRootFolders';
import ImportFile from 'typings/ImportFile';
import { SelectStateInputProps } from 'typings/props';
import { ApiError } from 'Utilities/Fetch/fetchJson';
import translate from 'Utilities/String/translate';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import {
  setAddMovieDefault,
  useAddMovieDefaults,
} from '../../addMovieDefaultsStore';
import {
  IMPORT_ITEM_LIMIT,
  importReducer,
  MovieLookupResult,
} from '../ImportMovieTypes';
import useImportLookupQueue from '../useImportLookupQueue';
import useImportMutation, { buildImportBody } from '../useImportMutation';
import ImportMovieFooter from './ImportMovieFooter';
import ImportMovieTable from './ImportMovieTable';

const EMPTY_IMPORT_FILES: ImportFile[] = [];

interface SelectionState {
  allSelected: boolean;
  allUnselected: boolean;
  lastToggled: string | null;
  selectedState: Record<string, boolean>;
}

function getSelectedIds(selectedState: Record<string, boolean>): string[] {
  return reduce(
    selectedState,
    (result: string[], value, id) => {
      if (value) {
        result.push(id);
      }
      return result;
    },
    []
  );
}

function ImportMovie() {
  const { rootFolderId: rootFolderIdParam } = useParams() as {
    rootFolderId: string;
  };
  const rootFolderId = Number.parseInt(rootFolderIdParam, 10);
  const scenesMatch = useMatch('/add/import/scenes/:rootFolderId');
  const itemType: 'movie' | 'scene' = scenesMatch ? 'scene' : 'movie';

  // The list endpoint already carries import files, but this page is reachable
  // by url with no list in the cache, so it reads the folder on its own.
  const {
    isFetching: rootFoldersFetching,
    isFetched: rootFoldersPopulated,
    error: rootFoldersError,
    data: rootFolder,
  } = useRootFolder(rootFolderId);

  const movieDefaults = useAddMovieDefaults();
  const qualityProfiles = useSelector(
    (state: { settings: { qualityProfiles: { items: { id: number }[] } } }) =>
      state.settings.qualityProfiles.items
  );

  const defaultMonitor = movieDefaults.monitor ?? 'movieOnly';
  const defaultQualityProfileId = movieDefaults.qualityProfileId;

  const path = rootFolder?.path;
  const importFiles = rootFolder?.importFiles ?? EMPTY_IMPORT_FILES;

  // Ensure a valid quality profile default is set
  useEffect(() => {
    if (
      qualityProfiles.length > 0 &&
      (!defaultQualityProfileId ||
        !qualityProfiles.some((p) => p.id === defaultQualityProfileId))
    ) {
      setAddMovieDefault('qualityProfileId', qualityProfiles[0].id);
    }
  }, [defaultQualityProfileId, qualityProfiles]);

  const [importState, dispatch] = useReducer(importReducer, {
    isLookingUp: false,
    items: [],
  });

  const [selectionState, setSelectionState] = useState<SelectionState>({
    allSelected: false,
    allUnselected: false,
    lastToggled: null,
    selectedState: {},
  });

  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<ApiError | null>(null);

  const { queueLookup, lookupUnsearched, cancelQueue, isLookingUp } =
    useImportLookupQueue(dispatch);

  const importMutation = useImportMutation(rootFolderId);

  const totalFiles = importFiles.length;
  const showLimitBanner =
    rootFoldersPopulated && totalFiles > IMPORT_ITEM_LIMIT;

  // Initialise items when importFiles become available
  const initialised = useRef(false);
  useEffect(() => {
    if (!importFiles.length) {
      return;
    }
    initialised.current = false; // reset so new batch of import files can re-init lookup
    dispatch({
      type: 'INIT_ITEMS',
      files: importFiles,
      itemType,
      defaults: {
        monitor: defaultMonitor,
        qualityProfileId: defaultQualityProfileId,
      },
    });
  }, [importFiles, itemType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Queue initial lookups once items are initialised
  useEffect(() => {
    if (initialised.current || !importState.items.length) {
      return;
    }
    initialised.current = true;

    importState.items.forEach((item) => {
      queueLookup({ id: item.id, term: item.term, itemType: item.itemType });
    });
  }, [importState.items, queueLookup]);

  const onSelectAllChange = useCallback(({ value }: { value: boolean }) => {
    setSelectionState(
      (prev) => selectAll(prev.selectedState, value) as SelectionState
    );
  }, []);

  const onSelectedChange = useCallback(
    ({ id, value, shiftKey }: SelectStateInputProps) => {
      setSelectionState(
        (prev) =>
          toggleSelected(
            prev,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            importState.items as unknown as any[],
            String(id),
            value ?? false,
            shiftKey
          ) as SelectionState
      );
    },
    [importState.items]
  );

  const onRemoveSelectedStateItem = useCallback((id: string) => {
    setSelectionState((prev) => {
      const selectedState = { ...prev.selectedState };
      delete selectedState[id];
      return { ...prev, selectedState };
    });
  }, []);

  const onLookup = useCallback(
    (opts: {
      id: string;
      term: string;
      itemType: 'movie' | 'scene';
      topOfQueue: boolean;
    }) => {
      queueLookup(opts);
    },
    [queueLookup]
  );

  const onMovieSelect = useCallback((id: string, movie: MovieLookupResult) => {
    dispatch({ type: 'SET_SELECTED_MOVIE', id, movie });
  }, []);

  const onItemValueChange = useCallback(
    (
      id: string,
      key: 'monitor' | 'qualityProfileId',
      value: string | number
    ) => {
      dispatch({ type: 'SET_ITEM_VALUE', id, key, value });
    },
    []
  );

  const onFooterInputChange = useCallback(
    ({ name, value }: { name: string; value: string | number }) => {
      const selectedIds = getSelectedIds(selectionState.selectedState);
      if (name === 'monitor') {
        setAddMovieDefault('monitor', value as string);
      } else if (name === 'qualityProfileId') {
        setAddMovieDefault('qualityProfileId', value as number);
      }
      selectedIds.forEach((id) => {
        dispatch({
          type: 'SET_ITEM_VALUE',
          id,
          key: name as 'monitor' | 'qualityProfileId',
          value,
        });
      });
    },
    [selectionState.selectedState]
  );

  const onImportPress = useCallback(async () => {
    const selectedIds = getSelectedIds(selectionState.selectedState);
    const selectedItems = importState.items.filter((item) =>
      selectedIds.includes(item.id)
    );

    const body = buildImportBody(selectedItems);
    if (!body.length) {
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      await importMutation.mutateAsync(body);

      // Build set of item IDs that were successfully queued for import
      const importedForeignIds = new Set(body.map((m) => m.foreignId));
      const idsToRemove = selectedItems
        .filter(
          (i) =>
            i.selectedMovie && importedForeignIds.has(i.selectedMovie.foreignId)
        )
        .map((i) => i.id);

      idsToRemove.forEach((id) => {
        dispatch({ type: 'REMOVE_ITEM', id });
      });
    } catch (err) {
      setImportError(err as ApiError);
    } finally {
      setIsImporting(false);
    }
  }, [importMutation, importState.items, selectionState.selectedState]);

  const onLookupUnsearched = useCallback(() => {
    lookupUnsearched(importState.items);
  }, [importState.items, lookupUnsearched]);

  const onCancelLookup = useCallback(() => {
    cancelQueue();
  }, [cancelQueue]);

  const selectedIds = getSelectedIds(selectionState.selectedState);

  return (
    <PageContent title={translate('ImportMovies')}>
      <PageContentBody>
        {rootFoldersFetching ? <LoadingIndicator /> : null}

        {!rootFoldersFetching && !!rootFoldersError ? (
          <Alert kind={kinds.DANGER}>{translate('RootFoldersLoadError')}</Alert>
        ) : null}

        {!rootFoldersError &&
        !rootFoldersFetching &&
        rootFoldersPopulated &&
        !importFiles.length ? (
          <Alert kind={kinds.INFO}>
            {translate('AllMoviesInPathHaveBeenImported', { path: path ?? '' })}
          </Alert>
        ) : null}

        {showLimitBanner ? (
          <Alert kind={kinds.WARNING}>
            {translate('ImportMovieLimitBanner', {
              limit: IMPORT_ITEM_LIMIT,
              total: totalFiles,
            })}
          </Alert>
        ) : null}

        {!rootFoldersError &&
        !rootFoldersFetching &&
        rootFoldersPopulated &&
        !!importFiles.length ? (
          <ImportMovieTable
            items={importState.items}
            isLookingUp={isLookingUp}
            allSelected={selectionState.allSelected}
            allUnselected={selectionState.allUnselected}
            selectedState={selectionState.selectedState}
            onSelectAllChange={onSelectAllChange}
            onSelectedChange={onSelectedChange}
            onRemoveSelectedStateItem={onRemoveSelectedStateItem}
            onLookup={onLookup}
            onMovieSelect={onMovieSelect}
            onItemValueChange={onItemValueChange}
          />
        ) : null}
      </PageContentBody>

      {!rootFoldersError && !rootFoldersFetching && !!importFiles.length ? (
        <ImportMovieFooter
          items={importState.items}
          selectedIds={selectedIds}
          defaultMonitor={defaultMonitor}
          defaultQualityProfileId={defaultQualityProfileId}
          isLookingUp={isLookingUp}
          isImporting={isImporting}
          importError={importError}
          onInputChange={onFooterInputChange}
          onImportPress={onImportPress}
          onLookupUnsearched={onLookupUnsearched}
          onCancelLookup={onCancelLookup}
        />
      ) : null}
    </PageContent>
  );
}

export default ImportMovie;
