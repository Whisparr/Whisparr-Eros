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
  useBulkDeleteCustomFormats,
  useBulkEditCustomFormats,
  useCustomFormats,
} from '../useCustomFormats';
import ManageCustomFormatsEditModal from './Edit/ManageCustomFormatsEditModal';
import ManageCustomFormatsModalRow from './ManageCustomFormatsModalRow';
import styles from './ManageCustomFormatsModalContent.css';

// TODO: This feels janky to do, but not sure of a better way currently
type OnSelectedChangeCallback = React.ComponentProps<
  typeof ManageCustomFormatsModalRow
>['onSelectedChange'];

const COLUMNS: Column[] = [
  {
    name: 'name',
    label: () => translate('Name'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'includeCustomFormatWhenRenaming',
    label: () => translate('IncludeCustomFormatWhenRenaming'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'actions',
    label: '',
    isVisible: true,
  },
];

interface ManageCustomFormatsModalContentProps {
  onModalClose(): void;
}

function ManageCustomFormatsModalContent(
  props: Readonly<ManageCustomFormatsModalContentProps>
) {
  const { onModalClose } = props;

  const { data, isFetching, isFetched, error } = useCustomFormats();

  // `createClientSideCollectionSelector` read the sort off the slice, which
  // nothing outside this modal ever set or read. It is modal-local now, as
  // #538 and #542 left it for indexers and import lists.
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

  const { bulkEditCustomFormats, isSaving } = useBulkEditCustomFormats();
  const { bulkDeleteCustomFormats, isDeleting } = useBulkDeleteCustomFormats();

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
  }, []);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const onEditPress = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const onEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const onConfirmDelete = useCallback(() => {
    bulkDeleteCustomFormats(selectedIds);
    setIsDeleteModalOpen(false);
  }, [selectedIds, bulkDeleteCustomFormats]);

  const onSavePress = useCallback(
    (payload: object) => {
      setIsEditModalOpen(false);

      bulkEditCustomFormats({
        ids: selectedIds,
        ...payload,
      });
    },
    [selectedIds, bulkEditCustomFormats]
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

  const errorMessage = getErrorMessage(error, 'Unable to load custom formats.');
  const anySelected = selectedCount > 0;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('ManageCustomFormats')}</ModalHeader>
      <ModalBody>
        {isFetching ? <LoadingIndicator /> : null}

        {error ? <div>{errorMessage}</div> : null}

        {isFetched && !error && !items.length ? (
          <Alert kind={kinds.INFO}>{translate('NoCustomFormatsFound')}</Alert>
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
            onSelectAllChange={onSelectAllChange}
            onSortPress={onSortPress}
          >
            <TableBody>
              {items.map((item) => {
                return (
                  <ManageCustomFormatsModalRow
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
        </div>

        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>

      <ManageCustomFormatsEditModal
        isOpen={isEditModalOpen}
        customFormatIds={selectedIds}
        onModalClose={onEditModalClose}
        onSavePress={onSavePress}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteSelectedCustomFormats')}
        message={translate('DeleteSelectedCustomFormatsMessageText', {
          count: selectedIds.length,
        })}
        confirmLabel={translate('Delete')}
        onConfirm={onConfirmDelete}
        onCancel={onDeleteModalClose}
      />
    </ModalContent>
  );
}

export default ManageCustomFormatsModalContent;
