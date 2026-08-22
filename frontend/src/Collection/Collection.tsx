import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Filter as AppStateFilter } from 'App/State/AppState';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageJumpBar from 'Components/Page/PageJumpBar';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import withScrollPosition from 'Components/withScrollPosition';
import useSelectState from 'Helpers/Hooks/useSelectState';
import { align, icons, kinds, sortDirections } from 'Helpers/Props';
import styles from 'Movie/Index/MovieIndex.css';
import scrollPositions from 'Store/scrollPositions';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import { COLLECTION_FILTERS } from './collectionFilters';
import CollectionFooter from './CollectionFooter';
import {
  setCollectionFilter,
  setCollectionSort,
  useCollectionOption,
} from './collectionOptionsStore';
import MovieCollectionFilterMenu from './Menus/MovieCollectionFilterMenu';
import MovieCollectionSortMenu from './Menus/MovieCollectionSortMenu';
import NoMovieCollections from './NoMovieCollections';
import CollectionOverviews from './Overview/CollectionOverviews';
import CollectionOverviewOptionsModal from './Overview/Options/CollectionOverviewOptionsModal';
import { useCollectionItems } from './useCollectionItems';

interface CollectionProps {
  initialScrollTop: number;
}

function Collection({ initialScrollTop }: CollectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const { items, totalItems, isFetching, isLoading, error, customFilters } =
    useCollectionItems();

  const sortKey = useCollectionOption('sortKey');
  const sortDirection = useCollectionOption('sortDirection');
  const selectedFilterKey = useCollectionOption('selectedFilterKey');

  const executeCommand = useExecuteCommand();
  const isRefreshingCollections = useCommandExecuting(
    commandNames.REFRESH_COLLECTIONS
  );

  const [selectState, setSelectState] = useSelectState();
  const { allSelected, allUnselected, selectedState } = selectState;

  const [jumpToCharacter, setJumpToCharacter] = useState<string | undefined>();
  const [isOverviewOptionsModalOpen, setIsOverviewOptionsModalOpen] =
    useState(false);

  useEffect(() => {
    setSelectState({ type: 'updateItems', items });
  }, [items, setSelectState]);

  const selectedIds = useMemo(
    () => (allUnselected ? [] : getSelectedIds(selectedState)),
    [allUnselected, selectedState]
  );

  const jumpBarItems = useMemo(() => {
    // Reset if not sorting by sortTitle
    if (sortKey !== 'sortTitle') {
      return { characters: {}, order: [] };
    }

    const characters = items.reduce((acc: Record<string, number>, item) => {
      let char = item.sortTitle.charAt(0);

      if (!Number.isNaN(Number(char))) {
        char = '#';
      }

      acc[char] = (acc[char] ?? 0) + 1;

      return acc;
    }, {});

    const order = Object.keys(characters).sort((a, b) => a.localeCompare(b));

    // Reverse if sorting descending
    if (sortDirection === sortDirections.DESCENDING) {
      order.reverse();
    }

    return { characters, order };
  }, [items, sortKey, sortDirection]);

  const handleSortSelect = useCallback((key: string) => {
    setCollectionSort({ sortKey: key });
  }, []);

  const handleFilterSelect = useCallback((key: string | number) => {
    setCollectionFilter(key);
  }, []);

  const handleScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    scrollPositions.movieCollections = scrollTop;
  }, []);

  const handleRefreshPress = useCallback(() => {
    executeCommand({ name: commandNames.REFRESH_COLLECTIONS });
  }, [executeCommand]);

  const handleSelectAllChange = useCallback(
    ({ value }: { value: boolean }) => {
      setSelectState({ type: value ? 'selectAll' : 'unselectAll', items });
    },
    [items, setSelectState]
  );

  const handleSelectAllPress = useCallback(() => {
    handleSelectAllChange({ value: !allSelected });
  }, [allSelected, handleSelectAllChange]);

  const handleSelectedChange = useCallback(
    ({
      id,
      value,
      shiftKey = false,
    }: {
      id: number;
      value: boolean;
      shiftKey?: boolean;
    }) => {
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

  const handleJumpBarItemPress = useCallback((character: string) => {
    setJumpToCharacter(character);
  }, []);

  const handleOverviewOptionsPress = useCallback(() => {
    setIsOverviewOptionsModalOpen(true);
  }, []);

  const handleOverviewOptionsModalClose = useCallback(() => {
    setIsOverviewOptionsModalOpen(false);
  }, []);

  const isLoaded = !!(
    !error &&
    !isLoading &&
    items.length &&
    scrollerRef.current
  );
  const hasNoCollection = !totalItems;

  return (
    <PageContent title={translate('Collections')}>
      <PageToolbar>
        <PageToolbarSection>
          <PageToolbarButton
            label={translate('RefreshCollections')}
            iconName={icons.REFRESH}
            isSpinning={isRefreshingCollections}
            isDisabled={hasNoCollection}
            onPress={handleRefreshPress}
          />

          <PageToolbarButton
            label={
              allSelected ? translate('UnselectAll') : translate('SelectAll')
            }
            iconName={icons.CHECK_SQUARE}
            isDisabled={hasNoCollection}
            onPress={handleSelectAllPress}
          />
        </PageToolbarSection>

        <PageToolbarSection alignContent={align.RIGHT} collapseButtons={false}>
          <PageToolbarButton
            label={translate('Options')}
            iconName={icons.OVERVIEW}
            onPress={handleOverviewOptionsPress}
          />

          <PageToolbarSeparator />

          <MovieCollectionSortMenu
            sortKey={sortKey}
            sortDirection={sortDirection}
            isDisabled={hasNoCollection}
            onSortSelect={handleSortSelect}
          />

          <MovieCollectionFilterMenu
            selectedFilterKey={selectedFilterKey}
            filters={COLLECTION_FILTERS as unknown as AppStateFilter[]}
            customFilters={customFilters}
            isDisabled={hasNoCollection}
            onFilterSelect={handleFilterSelect}
          />
        </PageToolbarSection>
      </PageToolbar>

      <div className={styles.pageContentBodyWrapper}>
        <PageContentBody
          ref={scrollerRef}
          className={styles.contentBody}
          onScroll={handleScroll}
        >
          {isFetching && isLoading ? <LoadingIndicator /> : null}

          {!isFetching && error ? (
            <Alert kind={kinds.DANGER}>
              {translate('UnableToLoadCollections')}
            </Alert>
          ) : null}

          {isLoaded ? (
            <div className={styles.contentBodyContainer}>
              <CollectionOverviews
                scroller={scrollerRef.current!}
                items={items}
                jumpToCharacter={jumpToCharacter}
                selectedState={selectedState}
                scrollTop={initialScrollTop}
                onSelectedChange={handleSelectedChange}
              />
            </div>
          ) : null}

          {!error && !isLoading && !items.length ? (
            <NoMovieCollections totalItems={totalItems} />
          ) : null}
        </PageContentBody>

        {isLoaded && jumpBarItems.order.length ? (
          <PageJumpBar
            items={jumpBarItems}
            onItemPress={handleJumpBarItemPress}
          />
        ) : null}
      </div>

      {isLoaded ? <CollectionFooter selectedIds={selectedIds} /> : null}

      <CollectionOverviewOptionsModal
        isOpen={isOverviewOptionsModalOpen}
        onModalClose={handleOverviewOptionsModalClose}
      />
    </PageContent>
  );
}

export default withScrollPosition(Collection, 'movieCollections');
