import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as commandNames from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import SelectInput, { SelectInputOption } from 'Components/Form/SelectInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Menu from 'Components/Menu/Menu';
import MenuButton from 'Components/Menu/MenuButton';
import MenuContent from 'Components/Menu/MenuContent';
import SelectedMenuItem from 'Components/Menu/SelectedMenuItem';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TablePager from 'Components/Table/TablePager';
import { align, icons, kinds } from 'Helpers/Props';
import { BOTH } from 'Helpers/Props/scrollDirections';
import { SortDirection } from 'Helpers/Props/sortDirections';
import ImportMode from 'InteractiveImport/ImportMode';
import SelectIndexerFlagsModal from 'InteractiveImport/IndexerFlags/SelectIndexerFlagsModal';
import InteractiveImport, {
  InteractiveImportCommandOptions,
} from 'InteractiveImport/InteractiveImport';
import {
  setInteractiveImportMode,
  setInteractiveImportSort,
  useInteractiveImportOptions,
} from 'InteractiveImport/interactiveImportOptionsStore';
import SelectLanguageModal from 'InteractiveImport/Language/SelectLanguageModal';
import SelectMovieModal from 'InteractiveImport/Movie/SelectMovieModal';
import SelectQualityModal from 'InteractiveImport/Quality/SelectQualityModal';
import SelectReleaseGroupModal from 'InteractiveImport/ReleaseGroup/SelectReleaseGroupModal';
import useInteractiveImport from 'InteractiveImport/useInteractiveImport';
import Language from 'Language/Language';
import Movie from 'Movie/Movie';
import { MovieFile } from 'MovieFile/MovieFile';
import {
  useDeleteMovieFiles,
  useUpdateMovieFiles,
} from 'MovieFile/useMovieFile';
import { QualityModel } from 'Quality/Quality';
import { SortCallback } from 'typings/callbacks';
import { CheckInputChanged } from 'typings/inputs';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import InteractiveImportRow from './InteractiveImportRow';
import useImportSelection from './useImportSelection';
import styles from './InteractiveImportModalContent.module.css';

type SelectType =
  'select' | 'movie' | 'releaseGroup' | 'quality' | 'language' | 'indexerFlags';

// TODO: This feels janky to do, but not sure of a better way currently
type OnSelectedChangeCallback = React.ComponentProps<
  typeof InteractiveImportRow
>['onSelectedChange'];

const PAGE_SIZE = 50;

const COLUMNS = [
  {
    name: 'relativePath',
    label: () => translate('RelativePath'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'movie',
    label: () => translate('Movie'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'releaseGroup',
    label: () => translate('ReleaseGroup'),
    isVisible: true,
  },
  {
    name: 'quality',
    label: () => translate('Quality'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'languages',
    label: () => translate('Languages'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'size',
    label: () => translate('Size'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'customFormats',
    label: React.createElement(Icon, {
      name: icons.INTERACTIVE,
      title: () => translate('CustomFormat'),
    }),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'indexerFlags',
    label: React.createElement(Icon, {
      name: icons.FLAG,
      title: () => translate('IndexerFlags'),
    }),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'rejections',
    label: React.createElement(Icon, {
      name: icons.DANGER,
      kind: kinds.DANGER,
      title: () => translate('Rejections'),
    }),
    isSortable: true,
    isVisible: true,
  },
];

const importModeOptions: SelectInputOption[] = [
  {
    key: 'chooseImportMode',
    value: () => translate('ChooseImportMode'),
    disabled: true,
  },
  {
    key: 'move',
    value: () => translate('MoveFiles'),
  },
  {
    key: 'copy',
    value: () => translate('HardlinkCopyFiles'),
  },
];

function isSameMovieFile(
  file: InteractiveImport,
  originalFile?: InteractiveImport
) {
  const { movie } = file;

  if (!originalFile) {
    return false;
  }

  if (!originalFile.movie || movie?.id !== originalFile.movie.id) {
    return false;
  }

  return true;
}

export interface InteractiveImportModalContentProps {
  downloadIds?: string[];
  movieId?: number;
  showMovie?: boolean;
  allowMovieChange?: boolean;
  showDelete?: boolean;
  showImportMode?: boolean;
  showFilterExistingFiles?: boolean;
  filterExistingFiles?: boolean;
  title?: string;
  folder?: string;
  initialSortKey?: string;
  initialSortDirection?: SortDirection;
  modalTitle: string;
  onModalClose(): void;
}

function InteractiveImportModalContent(
  props: InteractiveImportModalContentProps
) {
  const {
    downloadIds,
    movieId,
    allowMovieChange = true,
    showMovie = true,
    showFilterExistingFiles = false,
    filterExistingFiles: initialFilterExistingFiles = false,
    showDelete = false,
    showImportMode = true,
    title,
    folder,
    initialSortKey,
    initialSortDirection,
    modalTitle,
    onModalClose,
  } = props;

  const { sortKey, sortDirection, importMode } = useInteractiveImportOptions();

  // Seeded from the prop rather than hardcoded to false, so the caller's choice
  // is part of the first fetch instead of being ignored until the user picks it
  // from the menu themselves.
  const [filterExistingFiles, setFilterExistingFiles] = useState(
    initialFilterExistingFiles
  );

  const [page, setPage] = useState(1);
  const {
    items,
    pageItems,
    totalRecords,
    originalItems,
    isFetching,
    isFetched,
    error,
    updateItems,
  } = useInteractiveImport({
    downloadIds,
    movieId,
    folder,
    filterExistingFiles,
    page,
    pageSize: PAGE_SIZE,
  });

  const { mutate: deleteMovieFilesMutate, isPending: isDeleting } =
    useDeleteMovieFiles();
  const { mutate: updateMovieFilesMutate } = useUpdateMovieFiles();

  const [selectModalOpen, setSelectModalOpen] = useState<SelectType | null>(
    null
  );
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [interactiveImportErrorMessage, setInteractiveImportErrorMessage] =
    useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const currentPage = page;
  const { selectedState, selectPage, selectRow } = useImportSelection(
    items,
    pageItems,
    allowMovieChange,
    JSON.stringify([folder, downloadIds, movieId, filterExistingFiles])
  );
  const allSelected = pageItems.every((item) => selectedState[item.id]);
  const allUnselected = pageItems.every((item) => !selectedState[item.id]);
  const executeCommand = useExecuteCommand();

  useEffect(() => {
    if (!['relativePath', 'size'].includes(sortKey)) {
      setInteractiveImportSort({ sortKey: 'relativePath', sortDirection });
    }
  }, [sortKey, sortDirection]);

  const columns: Column[] = useMemo(() => {
    const result: Column[] = cloneDeep(COLUMNS).map((column) => ({
      ...column,
      isSortable: column.name === 'relativePath' || column.name === 'size',
    }));

    if (!showMovie) {
      const movieColumn = result.find((c) => c.name === 'movie');

      if (movieColumn) {
        movieColumn.isVisible = false;
      }
    }

    const showIndexerFlags = items.some((item) => item.indexerFlags);

    if (!showIndexerFlags) {
      const indexerFlagsColumn = result.find((c) => c.name === 'indexerFlags');

      if (indexerFlagsColumn) {
        indexerFlagsColumn.isVisible = false;
      }
    }

    return result;
  }, [showMovie, items]);

  const originalItemsById = useMemo(() => {
    return new Map(originalItems.map((item) => [item.id, item]));
  }, [originalItems]);

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedState[item.id]);
  }, [items, selectedState]);
  const selectedIds = useMemo(
    () => selectedItems.map((item) => item.id),
    [selectedItems]
  );
  const hasInvalidSelection = selectedItems.some(
    (item) => !item.movie || !item.quality || !item.languages
  );
  const hasSelectionWithoutMovieFile = selectedItems.some(
    (item) => !item.movieFileId
  );

  useEffect(() => {
    setPage(1);
  }, [
    folder,
    downloadIds,
    movieId,
    filterExistingFiles,
    sortKey,
    sortDirection,
  ]);

  useEffect(() => {
    if (!isFetching && !error && isFetched) {
      setPage((previous) => Math.min(previous, totalPages));
    }
  }, [totalPages, isFetching, error, isFetched]);

  const bulkSelectOptions = useMemo(() => {
    const options: SelectInputOption[] = [
      {
        key: 'select',
        value: translate('SelectDropdown'),
        disabled: true,
      },
      {
        key: 'quality',
        value: translate('SelectQuality'),
      },
      {
        key: 'releaseGroup',
        value: translate('SelectReleaseGroup'),
      },
      {
        key: 'language',
        value: translate('SelectLanguage'),
      },
      {
        key: 'indexerFlags',
        value: translate('SelectIndexerFlags'),
      },
    ];

    if (allowMovieChange) {
      options.splice(1, 0, {
        key: 'movie',
        value: translate('SelectMovie'),
      });
    }

    return options;
  }, [allowMovieChange]);

  useEffect(
    () => {
      if (initialSortKey) {
        setInteractiveImportSort({
          sortKey: initialSortKey,
          sortDirection: initialSortDirection,
        });
      }
    },
    // Only on open: the caller is stating where the table should start, not
    // pinning it there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleItemChange = useCallback(
    (id: number, changes: Partial<InteractiveImport>) => {
      updateItems([id], changes);
    },
    [updateItems]
  );

  const onFirstPagePress = useCallback(() => setPage(1), []);
  const onPreviousPagePress = useCallback(
    () => setPage(currentPage - 1),
    [currentPage]
  );
  const onNextPagePress = useCallback(
    () => setPage(currentPage + 1),
    [currentPage]
  );
  const onLastPagePress = useCallback(() => setPage(totalPages), [totalPages]);

  const onSelectAllChange = useCallback(
    ({ value }: CheckInputChanged) => selectPage(value),
    [selectPage]
  );

  const onSelectedChange = useCallback<OnSelectedChangeCallback>(
    ({ id, value, shiftKey = false }) => {
      selectRow(Number(id), !!value, shiftKey);
    },
    [selectRow]
  );

  const onDeleteSelectedPress = useCallback(() => {
    setIsConfirmDeleteModalOpen(true);
  }, [setIsConfirmDeleteModalOpen]);

  const onConfirmDelete = useCallback(() => {
    setIsConfirmDeleteModalOpen(false);

    const movieFileIds = items.reduce((acc: number[], item) => {
      if (selectedIds.indexOf(item.id) > -1 && item.movieFileId) {
        acc.push(item.movieFileId);
      }

      return acc;
    }, []);

    deleteMovieFilesMutate({ movieFileIds }, { onSuccess: onModalClose });
  }, [items, selectedIds, deleteMovieFilesMutate, onModalClose]);

  const onConfirmDeleteModalClose = useCallback(() => {
    setIsConfirmDeleteModalOpen(false);
  }, [setIsConfirmDeleteModalOpen]);

  const onImportSelectedPress = useCallback(() => {
    const finalImportMode =
      downloadIds?.length || !showImportMode ? 'auto' : importMode;

    const existingFiles: Partial<MovieFile>[] = [];
    const files: InteractiveImportCommandOptions[] = [];

    if (hasInvalidSelection) {
      return;
    }

    if (finalImportMode === 'chooseImportMode') {
      setInteractiveImportErrorMessage(
        translate('InteractiveImportNoImportMode')
      );

      return;
    }

    selectedItems.forEach((item) => {
      const {
        downloadId,
        movie,
        releaseGroup,
        quality,
        languages,
        indexerFlags,
        movieFileId,
      } = item;

      if (!movie) {
        setInteractiveImportErrorMessage(translate('InteractiveImportNoMovie'));
        return;
      }

      if (!quality) {
        setInteractiveImportErrorMessage(
          translate('InteractiveImportNoQuality')
        );
        return;
      }

      if (!languages) {
        setInteractiveImportErrorMessage(
          translate('InteractiveImportNoLanguage')
        );
        return;
      }

      setInteractiveImportErrorMessage(null);

      if (movieFileId) {
        const originalItem = originalItemsById.get(item.id);

        if (isSameMovieFile(item, originalItem)) {
          existingFiles.push({
            id: movieFileId,
            releaseGroup,
            quality,
            languages,
            indexerFlags,
          });

          return;
        }
      }

      files.push({
        path: item.path,
        folderName: item.folderName,
        movieId: movie.id,
        releaseGroup,
        quality,
        languages,
        indexerFlags,
        downloadId,
        movieFileId,
      });
    });

    let shouldClose = false;

    if (existingFiles.length) {
      updateMovieFilesMutate(existingFiles);

      shouldClose = true;
    }

    if (files.length) {
      executeCommand({
        name: commandNames.INTERACTIVE_IMPORT,
        files,
        importMode: finalImportMode,
        priority: 'high',
      });

      shouldClose = true;
    }

    if (shouldClose) {
      onModalClose();
    }
  }, [
    downloadIds,
    showImportMode,
    importMode,
    selectedItems,
    hasInvalidSelection,
    originalItemsById,
    onModalClose,
    updateMovieFilesMutate,
    executeCommand,
  ]);

  const onSortPress = useCallback<SortCallback>((sortKey, sortDirection) => {
    setPage(1);
    setInteractiveImportSort({ sortKey, sortDirection });
  }, []);

  const onFilterExistingFilesChange = useCallback(
    (value: string | undefined) => {
      setPage(1);
      setFilterExistingFiles(value !== 'all');
    },
    []
  );

  const onImportModeChange = useCallback<
    ({ value }: { value: ImportMode }) => void
  >(({ value }) => {
    setInteractiveImportMode(value);
  }, []);

  const onSelectModalSelect = useCallback<
    ({ value }: { value: SelectType }) => void
  >(
    ({ value }) => {
      setSelectModalOpen(value);
    },
    [setSelectModalOpen]
  );

  const onSelectModalClose = useCallback(() => {
    setSelectModalOpen(null);
  }, [setSelectModalOpen]);

  const onMovieSelect = useCallback(
    (movie: Movie) => {
      updateItems(selectedIds, { movie });

      setSelectModalOpen(null);
    },
    [selectedIds, setSelectModalOpen, updateItems]
  );

  const onReleaseGroupSelect = useCallback(
    (releaseGroup: string) => {
      updateItems(selectedIds, { releaseGroup });

      setSelectModalOpen(null);
    },
    [selectedIds, updateItems]
  );

  const onLanguagesSelect = useCallback(
    (newLanguages: Language[]) => {
      updateItems(selectedIds, { languages: newLanguages });

      setSelectModalOpen(null);
    },
    [selectedIds, updateItems]
  );

  const onQualitySelect = useCallback(
    (quality: QualityModel) => {
      updateItems(selectedIds, { quality });

      setSelectModalOpen(null);
    },
    [selectedIds, updateItems]
  );

  const onIndexerFlagsSelect = useCallback(
    (indexerFlags: number) => {
      updateItems(selectedIds, { indexerFlags });

      setSelectModalOpen(null);
    },
    [selectedIds, updateItems]
  );

  const errorMessage = getErrorMessage(
    error,
    translate('InteractiveImportLoadError')
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {modalTitle} - {title || folder}
      </ModalHeader>

      <ModalBody key={currentPage} scrollDirection={BOTH}>
        {showFilterExistingFiles && (
          <div className={styles.filterContainer}>
            <Menu alignMenu={align.RIGHT}>
              <MenuButton>
                <Icon name={icons.FILTER} size={22} />

                <div className={styles.filterText}>
                  {filterExistingFiles
                    ? translate('UnmappedFilesOnly')
                    : translate('AllFiles')}
                </div>
              </MenuButton>

              <MenuContent>
                <SelectedMenuItem
                  name="all"
                  isSelected={!filterExistingFiles}
                  onPress={onFilterExistingFilesChange}
                >
                  {translate('AllFiles')}
                </SelectedMenuItem>

                <SelectedMenuItem
                  name="new"
                  isSelected={filterExistingFiles}
                  onPress={onFilterExistingFilesChange}
                >
                  {translate('UnmappedFilesOnly')}
                </SelectedMenuItem>
              </MenuContent>
            </Menu>
          </div>
        )}

        {isFetching ? <LoadingIndicator /> : null}

        {error ? <div>{errorMessage}</div> : null}

        {isFetched && !!items.length && !isFetching ? (
          <Table
            columns={columns}
            horizontalScroll={true}
            selectAll={true}
            allSelected={allSelected}
            allUnselected={allUnselected}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortPress={onSortPress}
            onSelectAllChange={onSelectAllChange}
          >
            <TableBody>
              {pageItems.map((item) => {
                return (
                  <InteractiveImportRow
                    key={item.id}
                    isSelected={selectedState[item.id]}
                    {...item}
                    allowMovieChange={allowMovieChange}
                    columns={columns}
                    modalTitle={modalTitle}
                    onItemChange={handleItemChange}
                    onSelectedChange={onSelectedChange}
                  />
                );
              })}
            </TableBody>
          </Table>
        ) : null}

        {isFetched && !items.length && !isFetching
          ? translate('InteractiveImportNoFilesFound')
          : null}
      </ModalBody>

      {isFetched && !!items.length && !isFetching ? (
        <TablePager
          page={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onFirstPagePress={onFirstPagePress}
          onPreviousPagePress={onPreviousPagePress}
          onNextPagePress={onNextPagePress}
          onLastPagePress={onLastPagePress}
          onPageSelect={setPage}
        />
      ) : null}

      <ModalFooter className={styles.footer}>
        <div className={styles.leftButtons}>
          {showDelete ? (
            <SpinnerButton
              className={styles.deleteButton}
              kind={kinds.DANGER}
              isSpinning={isDeleting}
              isDisabled={!selectedIds.length || hasSelectionWithoutMovieFile}
              onPress={onDeleteSelectedPress}
            >
              {translate('Delete')}
            </SpinnerButton>
          ) : null}

          {!downloadIds?.length && showImportMode ? (
            <SelectInput
              className={styles.importMode}
              name="importMode"
              value={importMode}
              values={importModeOptions}
              onChange={onImportModeChange}
            />
          ) : null}

          <SelectInput
            className={styles.bulkSelect}
            name="select"
            value="select"
            values={bulkSelectOptions}
            isDisabled={!selectedIds.length}
            onChange={onSelectModalSelect}
          />
        </div>

        <div className={styles.rightButtons}>
          <Button onPress={onModalClose}>{translate('Cancel')}</Button>

          {interactiveImportErrorMessage && (
            <span className={styles.errorMessage}>
              {interactiveImportErrorMessage}
            </span>
          )}

          <Button
            kind={kinds.SUCCESS}
            isDisabled={
              !selectedIds.length || hasInvalidSelection || isFetching
            }
            onPress={onImportSelectedPress}
          >
            {translate('Import')} ({selectedIds.length})
          </Button>
        </div>
      </ModalFooter>

      <SelectMovieModal
        isOpen={selectModalOpen === 'movie'}
        modalTitle={modalTitle}
        onMovieSelect={onMovieSelect}
        onModalClose={onSelectModalClose}
      />

      <SelectReleaseGroupModal
        isOpen={selectModalOpen === 'releaseGroup'}
        releaseGroup=""
        modalTitle={modalTitle}
        onReleaseGroupSelect={onReleaseGroupSelect}
        onModalClose={onSelectModalClose}
      />

      <SelectLanguageModal
        isOpen={selectModalOpen === 'language'}
        languageIds={[0]}
        modalTitle={modalTitle}
        onLanguagesSelect={onLanguagesSelect}
        onModalClose={onSelectModalClose}
      />

      <SelectQualityModal
        isOpen={selectModalOpen === 'quality'}
        qualityId={0}
        proper={false}
        real={false}
        modalTitle={modalTitle}
        onQualitySelect={onQualitySelect}
        onModalClose={onSelectModalClose}
      />

      <SelectIndexerFlagsModal
        isOpen={selectModalOpen === 'indexerFlags'}
        indexerFlags={0}
        modalTitle={modalTitle}
        onIndexerFlagsSelect={onIndexerFlagsSelect}
        onModalClose={onSelectModalClose}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteSelectedMovieFiles')}
        message={translate('DeleteSelectedMovieFilesHelpText')}
        confirmLabel={translate('Delete')}
        onConfirm={onConfirmDelete}
        onCancel={onConfirmDeleteModalClose}
      />
    </ModalContent>
  );
}

export default InteractiveImportModalContent;
