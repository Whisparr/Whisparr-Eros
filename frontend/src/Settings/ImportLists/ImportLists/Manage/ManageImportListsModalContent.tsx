import React, { useCallback, useMemo, useState } from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import useSelectState from 'Helpers/Hooks/useSelectState';
import { kinds, sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { CheckInputChanged } from 'typings/inputs';
import sortByProp from 'Utilities/Array/sortByProp';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import {
  useBulkDeleteImportLists,
  useBulkEditImportLists,
  useImportLists,
} from '../useImportLists';
import ManageImportListsEditModal from './Edit/ManageImportListsEditModal';
import ManageImportListsModalRow from './ManageImportListsModalRow';
import TagsModal from './Tags/TagsModal';
import styles from './ManageImportListsModalContent.css';

// TODO: This feels janky to do, but not sure of a better way currently
type OnSelectedChangeCallback = React.ComponentProps<
  typeof ManageImportListsModalRow
>['onSelectedChange'];

const COLUMNS: Column[] = [
  {
    name: 'name',
    label: () => translate('Name'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'implementation',
    label: () => translate('Implementation'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'qualityProfileId',
    label: () => translate('QualityProfile'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'minimumAvailability',
    label: () => translate('MinimumAvailability'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'rootFolderPath',
    label: () => translate('RootFolder'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'enabled',
    label: () => translate('Enabled'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'enableAuto',
    label: () => translate('AutomaticAdd'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'tags',
    label: () => translate('Tags'),
    isSortable: true,
    isVisible: true,
  },
];

interface ManageImportListsModalContentProps {
  onModalClose(): void;
}

function ManageImportListsModalContent(
  props: Readonly<ManageImportListsModalContentProps>
) {
  const { onModalClose } = props;

  const { data, isFetching, isFetched, error } = useImportLists();

  // `createClientSideCollectionSelector` read the sort off the slice, which
  // nothing outside this modal ever set or read. It is modal-local now, the
  // same as #538 left it for indexers; sections 10 and 11 have the same modal
  // and a shared hook wants shaping once there is a third consumer.
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    sortDirections.ASCENDING
  );

  const items = useMemo(() => {
    const sorted = [...data].sort(
      sortByProp(sortKey as keyof (typeof data)[0])
    );

    return sortDirection === sortDirections.ASCENDING
      ? sorted
      : sorted.reverse();
  }, [data, sortKey, sortDirection]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isSavingTags, setIsSavingTags] = useState(false);

  // The slice never reset this, so after one Set Tags save every later bulk
  // edit spun the Set Tags button as well -- the same fault #538 found in the
  // indexer copy of this modal. Clearing it when the mutation settles is what
  // the flag always meant.
  const handleBulkEditSettled = useCallback(() => {
    setIsSavingTags(false);
  }, []);

  const { bulkEditImportLists, isSaving } = useBulkEditImportLists(
    handleBulkEditSettled
  );
  const { bulkDeleteImportLists, isDeleting } = useBulkDeleteImportLists();

  const [selectState, setSelectState] = useSelectState();

  const { allSelected, allUnselected, selectedState } = selectState;

  const selectedIds: number[] = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const selectedCount = selectedIds.length;

  const onSortPress = useCallback(
    (value: string) => {
      setSortDirection((currentDirection) => {
        if (value !== sortKey) {
          return sortDirections.ASCENDING;
        }

        return currentDirection === sortDirections.ASCENDING
          ? sortDirections.DESCENDING
          : sortDirections.ASCENDING;
      });

      setSortKey(value);
    },
    [sortKey]
  );

  const onDeletePress = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, [setIsDeleteModalOpen]);

  const onEditPress = useCallback(() => {
    setIsEditModalOpen(true);
  }, [setIsEditModalOpen]);

  const onEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, [setIsEditModalOpen]);

  const onConfirmDelete = useCallback(() => {
    bulkDeleteImportLists(selectedIds);
    setIsDeleteModalOpen(false);
  }, [selectedIds, bulkDeleteImportLists]);

  const onSavePress = useCallback(
    (payload: object) => {
      setIsEditModalOpen(false);

      bulkEditImportLists({
        ids: selectedIds,
        ...payload,
      });
    },
    [selectedIds, bulkEditImportLists]
  );

  const onTagsPress = useCallback(() => {
    setIsTagsModalOpen(true);
  }, [setIsTagsModalOpen]);

  const onTagsModalClose = useCallback(() => {
    setIsTagsModalOpen(false);
  }, [setIsTagsModalOpen]);

  const onApplyTagsPress = useCallback(
    (tags: number[], applyTags: string) => {
      setIsSavingTags(true);
      setIsTagsModalOpen(false);

      bulkEditImportLists({
        ids: selectedIds,
        tags,
        applyTags,
      });
    },
    [selectedIds, bulkEditImportLists]
  );

  const onSelectAllChange = useCallback(
    ({ value }: CheckInputChanged) => {
      setSelectState({ type: value ? 'selectAll' : 'unselectAll', items });
    },
    [items, setSelectState]
  );

  const onSelectedChange = useCallback<OnSelectedChangeCallback>(
    ({ id, value, shiftKey = false }) => {
      setSelectState({
        type: 'toggleSelected',
        items,
        id,
        isSelected: value,
        shiftKey,
      });
    },
    [items, setSelectState]
  );

  const errorMessage = getErrorMessage(error, 'Unable to load import lists.');
  const anySelected = selectedCount > 0;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('ManageImportLists')}</ModalHeader>
      <ModalBody>
        {isFetching ? <LoadingIndicator /> : null}

        {error ? <div>{errorMessage}</div> : null}

        {isFetched && !error && !items.length ? (
          <Alert kind={kinds.INFO}>{translate('NoImportListsFound')}</Alert>
        ) : null}

        {isFetched && !!items.length && !isFetching ? (
          <Table
            columns={COLUMNS}
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
              {items.map((item) => {
                return (
                  <ManageImportListsModalRow
                    key={item.id}
                    isSelected={selectedState[item.id]}
                    {...item}
                    columns={COLUMNS}
                    onSelectedChange={onSelectedChange}
                  />
                );
              })}
            </TableBody>
          </Table>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <div className={styles.leftButtons}>
          <SpinnerButton
            kind={kinds.DANGER}
            isSpinning={isDeleting}
            isDisabled={!anySelected}
            onPress={onDeletePress}
          >
            {translate('Delete')}
          </SpinnerButton>

          <SpinnerButton
            isSpinning={isSaving}
            isDisabled={!anySelected}
            onPress={onEditPress}
          >
            {translate('Edit')}
          </SpinnerButton>

          <SpinnerButton
            isSpinning={isSaving && isSavingTags}
            isDisabled={!anySelected}
            onPress={onTagsPress}
          >
            {translate('SetTags')}
          </SpinnerButton>
        </div>

        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>

      <ManageImportListsEditModal
        isOpen={isEditModalOpen}
        importListIds={selectedIds}
        onModalClose={onEditModalClose}
        onSavePress={onSavePress}
      />

      <TagsModal
        isOpen={isTagsModalOpen}
        ids={selectedIds}
        onApplyTagsPress={onApplyTagsPress}
        onModalClose={onTagsModalClose}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteSelectedImportLists')}
        message={translate('DeleteSelectedImportListsMessageText', {
          count: selectedIds.length,
        })}
        confirmLabel={translate('Delete')}
        onConfirm={onConfirmDelete}
        onCancel={onDeleteModalClose}
      />
    </ModalContent>
  );
}

export default ManageImportListsModalContent;
