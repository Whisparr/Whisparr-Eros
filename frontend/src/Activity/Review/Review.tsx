import React, { useCallback, useMemo, useState } from 'react';
import { SelectProvider } from 'App/SelectContext';
import Alert from 'Components/Alert';
import { SelectInputOption } from 'Components/Form/SelectInput';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import TablePager from 'Components/Table/TablePager';
import useSelectState from 'Helpers/Hooks/useSelectState';
import { align, icons, kinds } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { useQualityDefinitions } from 'Settings/Quality/Definition/useQualityDefinitions';
import { CheckInputChanged } from 'typings/inputs';
import { SelectStateInputProps } from 'typings/props';
import { ReviewActionResult } from 'typings/Review';
import { TableOptionsChangePayload } from 'typings/Table';
import { ApiError } from 'Utilities/Fetch/fetchJson';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import {
  setReviewOptions,
  setReviewSort,
  useReviewOptions,
} from './reviewOptionsStore';
import ReviewRow, { ReviewOverride } from './ReviewRow';
import useReview, {
  ApproveReviewData,
  ApproveReviewItem,
  useApproveReviewItems,
  useRejectReviewItems,
  useRemoveReviewItems,
} from './useReview';

type ConfirmAction = 'approve' | 'reject' | 'remove';

function Review() {
  const { columns, pageSize, sortKey, sortDirection } = useReviewOptions();

  const {
    records: items,
    totalPages,
    totalRecords,
    isFetching,
    isFetched,
    isLoading,
    error,
    page,
    goToPage,
  } = useReview();

  const { approveReviewItems, isApproving } = useApproveReviewItems();
  const { rejectReviewItems, isRejecting } = useRejectReviewItems();
  const { removeReviewItems, isRemoving } = useRemoveReviewItems();
  const { data: qualityDefinitions } = useQualityDefinitions();

  const [overrides, setOverrides] = useState<Record<number, ReviewOverride>>(
    {}
  );
  const [approvingIds, setApprovingIds] = useState<number[]>([]);
  const [failures, setFailures] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmIds, setConfirmIds] = useState<number[]>([]);

  const [selectState, setSelectState] = useSelectState();
  const { allSelected, allUnselected, selectedState } = selectState;

  const selectedIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const qualityOptions = useMemo<SelectInputOption[]>(() => {
    const options = [...qualityDefinitions]
      .sort((a, b) => a.weight - b.weight)
      .map(({ quality }) => ({
        key: quality.id,
        value: quality.name,
      }));

    // The row shows Unknown until a quality is picked
    if (!options.some((option) => option.key === 0)) {
      options.unshift({ key: 0, value: translate('Unknown') });
    }

    return options;
  }, [qualityDefinitions]);

  const handleSelectAllChange = useCallback(
    ({ value }: CheckInputChanged) => {
      setSelectState({ type: value ? 'selectAll' : 'unselectAll', items });
    },
    [items, setSelectState]
  );

  const handleSelectedChange = useCallback(
    ({ id, value, shiftKey = false }: SelectStateInputProps) => {
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

  const handleOverrideChange = useCallback(
    (id: number, override: ReviewOverride) => {
      setOverrides((current) => ({ ...current, [id]: override }));
    },
    []
  );

  const approve = useCallback(
    (ids: number[]) => {
      setFailures([]);
      setApprovingIds((current) => [...current, ...ids]);

      // A release with a chosen scene or quality carries its own choices, the
      // rest are listed by id. One request, so the server can tell when two
      // selected releases would be grabbed for the same scene.
      const items: ApproveReviewItem[] = [];
      const plain: number[] = [];

      ids.forEach((id) => {
        const override = overrides[id];

        if (override?.scene) {
          items.push({
            id,
            // A scene from StashDB is added to the library when the release is grabbed
            ...(override.scene.inLibrary === false
              ? { foreignId: override.scene.foreignId }
              : { movieId: override.scene.movieId }),
            manualMatch: true,
            qualityId: override.qualityId,
          });
        } else if (override?.movieId || override?.qualityId) {
          items.push({
            id,
            movieId: override.movieId,
            qualityId: override.qualityId,
          });
        } else {
          plain.push(id);
        }
      });

      const request: ApproveReviewData = {};

      if (plain.length) {
        request.ids = plain;
      }

      if (items.length) {
        request.items = items;
      }

      const settle = () => {
        setApprovingIds((current) => current.filter((id) => !ids.includes(id)));
      };

      approveReviewItems(request, {
        onSuccess: (result: ReviewActionResult) => {
          settle();

          if (result.failed.length) {
            setFailures((current) => [
              ...current,
              ...result.failed.map((f) => f.message),
            ]);
          }
        },
        onError: (approveError: ApiError) => {
          settle();
          setFailures((current) => [
            ...current,
            getErrorMessage(approveError, approveError.message),
          ]);
        },
      });
    },
    [overrides, approveReviewItems]
  );

  const handleApprovePress = useCallback(
    (id: number) => {
      approve([id]);
    },
    [approve]
  );

  const handleRejectPress = useCallback((id: number) => {
    setConfirmIds([id]);
    setConfirmAction('reject');
  }, []);

  const handleRemovePress = useCallback(
    (id: number) => {
      removeReviewItems({ ids: [id] });
    },
    [removeReviewItems]
  );

  const handleBulkPress = useCallback(
    (action: ConfirmAction) => {
      setConfirmIds(selectedIds);
      setConfirmAction(action);
    },
    [selectedIds]
  );

  const handleApproveSelectedPress = useCallback(() => {
    handleBulkPress('approve');
  }, [handleBulkPress]);

  const handleRejectSelectedPress = useCallback(() => {
    handleBulkPress('reject');
  }, [handleBulkPress]);

  const handleRemoveSelectedPress = useCallback(() => {
    handleBulkPress('remove');
  }, [handleBulkPress]);

  const handleConfirm = useCallback(() => {
    if (confirmAction === 'approve') {
      approve(confirmIds);
    } else if (confirmAction === 'reject') {
      rejectReviewItems({ ids: confirmIds });
    } else if (confirmAction === 'remove') {
      removeReviewItems({ ids: confirmIds });
    }

    setConfirmAction(null);
    setConfirmIds([]);
    setSelectState({ type: 'unselectAll', items });
  }, [
    confirmAction,
    confirmIds,
    items,
    approve,
    rejectReviewItems,
    removeReviewItems,
    setSelectState,
  ]);

  const handleConfirmCancel = useCallback(() => {
    setConfirmAction(null);
    setConfirmIds([]);
  }, []);

  const handleSortPress = useCallback(
    (sortKey: string, sortDirection?: SortDirection) => {
      setReviewSort({ sortKey, sortDirection });
    },
    []
  );

  const handleTableOptionChange = useCallback(
    (payload: TableOptionsChangePayload) => {
      setReviewOptions(payload);

      if (payload.pageSize) {
        goToPage(1);
      }
    },
    [goToPage]
  );

  const handleFirstPagePress = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const handlePreviousPagePress = useCallback(() => {
    goToPage(Math.max(page - 1, 1));
  }, [goToPage, page]);

  const handleNextPagePress = useCallback(() => {
    goToPage(Math.min(page + 1, totalPages));
  }, [goToPage, page, totalPages]);

  const handleLastPagePress = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  const confirmModal = useMemo<{
    kind: typeof kinds.PRIMARY | typeof kinds.DANGER;
    title: string;
    message: string;
    confirmLabel: string;
  }>(() => {
    switch (confirmAction) {
      case 'approve':
        return {
          kind: kinds.PRIMARY,
          title: translate('ApproveSelected'),
          message: translate('ApproveSelectedReviewMessageText'),
          confirmLabel: translate('Approve'),
        };
      case 'reject':
        return {
          kind: kinds.DANGER,
          title: translate('Reject'),
          message: translate('RejectSelectedReviewMessageText'),
          confirmLabel: translate('Reject'),
        };
      default:
        return {
          kind: kinds.DANGER,
          title: translate('RemoveSelected'),
          message: translate('RemoveSelectedReviewMessageText'),
          confirmLabel: translate('RemoveSelected'),
        };
    }
  }, [confirmAction]);

  return (
    <SelectProvider items={items}>
      <PageContent title={translate('Review')}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('ApproveSelected')}
              iconName={icons.DOWNLOAD}
              isDisabled={!selectedIds.length}
              isSpinning={isApproving}
              onPress={handleApproveSelectedPress}
            />

            <PageToolbarButton
              label={translate('RejectSelected')}
              iconName={icons.BLOCKLIST}
              isDisabled={!selectedIds.length}
              isSpinning={isRejecting}
              onPress={handleRejectSelectedPress}
            />

            <PageToolbarButton
              label={translate('RemoveSelected')}
              iconName={icons.REMOVE}
              isDisabled={!selectedIds.length}
              isSpinning={isRemoving}
              onPress={handleRemoveSelectedPress}
            />
          </PageToolbarSection>

          <PageToolbarSection alignContent={align.RIGHT}>
            <TableOptionsModalWrapper
              columns={columns}
              pageSize={pageSize}
              onTableOptionChange={handleTableOptionChange}
            >
              <PageToolbarButton
                label={translate('Options')}
                iconName={icons.TABLE}
              />
            </TableOptionsModalWrapper>
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody>
          {failures.length ? (
            <Alert kind={kinds.DANGER}>
              <div>
                {translate('ReviewApproveFailed', { count: failures.length })}
              </div>
              <ul>
                {failures.map((failure, index) => (
                  <li key={index}>{failure}</li>
                ))}
              </ul>
            </Alert>
          ) : null}

          {isLoading && !isFetched ? <LoadingIndicator /> : null}

          {!isLoading && !!error ? (
            <Alert kind={kinds.DANGER}>{translate('ReviewLoadError')}</Alert>
          ) : null}

          {isFetched && !error && !items.length ? (
            <Alert kind={kinds.INFO}>{translate('NoReviewItems')}</Alert>
          ) : null}

          {isFetched && !error && !!items.length ? (
            <div>
              <Table
                selectAll={true}
                allSelected={allSelected}
                allUnselected={allUnselected}
                columns={columns}
                pageSize={pageSize}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onTableOptionChange={handleTableOptionChange}
                onSelectAllChange={handleSelectAllChange}
                onSortPress={handleSortPress}
              >
                <TableBody>
                  {items.map((item) => {
                    return (
                      <ReviewRow
                        key={item.id}
                        isSelected={selectedState[item.id] || false}
                        columns={columns}
                        qualityOptions={qualityOptions}
                        override={overrides[item.id]}
                        isApproving={approvingIds.includes(item.id)}
                        {...item}
                        onSelectedChange={handleSelectedChange}
                        onOverrideChange={handleOverrideChange}
                        onApprovePress={handleApprovePress}
                        onRejectPress={handleRejectPress}
                        onRemovePress={handleRemovePress}
                      />
                    );
                  })}
                </TableBody>
              </Table>

              <TablePager
                page={page}
                totalPages={totalPages}
                totalRecords={totalRecords}
                isFetching={isFetching}
                onFirstPagePress={handleFirstPagePress}
                onPreviousPagePress={handlePreviousPagePress}
                onNextPagePress={handleNextPagePress}
                onLastPagePress={handleLastPagePress}
                onPageSelect={goToPage}
              />
            </div>
          ) : null}
        </PageContentBody>

        <ConfirmModal
          isOpen={!!confirmAction}
          kind={confirmModal.kind}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={handleConfirm}
          onCancel={handleConfirmCancel}
        />
      </PageContent>
    </SelectProvider>
  );
}

export default Review;
