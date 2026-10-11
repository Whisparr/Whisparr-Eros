import throttle from 'lodash/throttle';
import React, {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import Alert from 'Components/Alert';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import FilterMenu from 'Components/Menu/FilterMenu';
import PageMenuButton from 'Components/Menu/PageMenuButton';
import Column from 'Components/Table/Column';
import { Filter as AppStateFilter } from 'Filters/Filter';
import useMeasure from 'Helpers/Hooks/useMeasure';
import { align, icons, kinds, sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { InputChanged } from 'typings/inputs';
import Release from 'typings/Release';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import InteractiveSearchFilterModal from './InteractiveSearchFilterModal';
import InteractiveSearchPayload from './InteractiveSearchPayload';
import InteractiveSearchRow from './InteractiveSearchRow';
import InteractiveSearchTableHeader from './InteractiveSearchTableHeader';
import { RELEASE_FILTERS } from './releaseFilters';
import { setReleasesFilter, setReleasesSort } from './releaseOptionsStore';
import { useReleases } from './useReleases';
import styles from './InteractiveSearch.module.css';

const ESTIMATED_ROW_HEIGHT = 35;

interface RowItemData {
  items: Release[];
  searchPayload: InteractiveSearchPayload;
  setRowHeight: (index: number, height: number) => void;
}

function Row({
  index,
  style,
  data,
}: Readonly<ListChildComponentProps<RowItemData>>) {
  const { items, searchPayload, setRowHeight } = data;

  if (index >= items.length) {
    return null;
  }

  const item = items[index];

  return (
    <InteractiveSearchRow
      key={`${item.indexerId}-${item.guid}`}
      index={index}
      style={style}
      setRowHeight={setRowHeight}
      {...item}
      searchPayload={searchPayload}
    />
  );
}

const columns: Column[] = [
  {
    name: 'protocol',
    label: () => translate('Source'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'age',
    label: () => translate('Age'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'title',
    label: () => translate('Title'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'indexer',
    label: () => translate('Indexer'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'history',
    label: () => translate('History'),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING,
    isVisible: true,
  },
  {
    name: 'size',
    label: () => translate('Size'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'peers',
    label: () => translate('Peers'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'languages',
    label: () => translate('Language'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'qualityWeight',
    label: () => translate('Quality'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'customFormatScore',
    label: React.createElement(Icon, {
      name: icons.SCORE,
      title: () => translate('CustomFormatScore'),
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
      title: () => translate('Rejections'),
    }),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING,
    isVisible: true,
  },
  {
    name: 'releaseWeight',
    label: React.createElement(Icon, { name: icons.DOWNLOAD }),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING,
    isVisible: true,
  },
];

interface InteractiveSearchProps {
  searchPayload: InteractiveSearchPayload;
  scrollerRef: RefObject<HTMLDivElement | null>;
}

function InteractiveSearch({
  searchPayload,
  scrollerRef,
}: Readonly<InteractiveSearchProps>) {
  const [filter, setFilter] = useState('');

  const {
    items,
    totalItems,
    isFetching,
    isPopulated,
    error,
    selectedFilterKey,
    sortKey,
    sortDirection,
    customFilters,
  } = useReleases(searchPayload, filter);

  const listRef = useRef<VariableSizeList<RowItemData>>(null);
  const listOuterRef = useRef<HTMLDivElement>(null);
  const rowHeights = useRef<number[]>([]);
  const [measureRef, bounds] = useMeasure();
  const [viewportHeight, setViewportHeight] = useState(0);

  const setRowHeight = useCallback((index: number, height: number) => {
    if (rowHeights.current[index] === height) {
      return;
    }

    rowHeights.current[index] = height;
    listRef.current?.resetAfterIndex(index);
  }, []);

  const getRowHeight = useCallback((index: number) => {
    return rowHeights.current[index] ?? ESTIMATED_ROW_HEIGHT;
  }, []);

  useLayoutEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [items]);

  // The modal body is what scrolls, not the list, so the list is sized to the
  // modal's viewport and follows its scroll position.
  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const updateHeight = () => setViewportHeight(scroller.clientHeight);

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(scroller);

    return () => observer.disconnect();
  }, [scrollerRef]);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const handleScroll = throttle(() => {
      const outer = listOuterRef.current;

      if (!outer) {
        return;
      }

      const scrolled =
        scroller.getBoundingClientRect().top -
        outer.getBoundingClientRect().top;

      listRef.current?.scrollTo(Math.max(0, scrolled));
    }, 10);

    scroller.addEventListener('scroll', handleScroll);

    return () => {
      handleScroll.cancel();
      scroller.removeEventListener('scroll', handleScroll);
    };
  }, [scrollerRef]);

  const itemData = useMemo<RowItemData>(
    () => ({ items, searchPayload, setRowHeight }),
    [items, searchPayload, setRowHeight]
  );

  const handleFilterChange = useCallback(({ value }: InputChanged<string>) => {
    setFilter(value);
  }, []);

  const handleFilterSelect = useCallback(
    (selectedFilterKey: string | number) => {
      setReleasesFilter(selectedFilterKey);
    },
    []
  );

  const handleSortPress = useCallback(
    (sortKey: string, sortDirection?: SortDirection) => {
      setReleasesSort(sortKey, sortDirection);
    },
    []
  );

  const errorMessage = getErrorMessage(error);

  return (
    <div>
      <div className={styles.filterRow}>
        <div className={styles.filterInput}>
          <TextInput
            name="releaseFilter"
            value={filter}
            placeholder={translate('FilterReleasesPlaceholder')}
            onChange={handleFilterChange}
          />
        </div>

        <FilterMenu
          alignMenu={align.RIGHT}
          selectedFilterKey={selectedFilterKey}
          filters={RELEASE_FILTERS as unknown as AppStateFilter[]}
          customFilters={customFilters}
          buttonComponent={PageMenuButton}
          filterModalConnectorComponent={InteractiveSearchFilterModal}
          filterModalConnectorComponentProps={{ searchPayload }}
          onFilterSelect={handleFilterSelect}
        />
      </div>

      {isFetching ? <LoadingIndicator /> : null}

      {!isFetching && error ? (
        <Alert kind={kinds.DANGER} className={styles.alert}>
          {errorMessage ? (
            <>
              {translate('InteractiveSearchResultsFailedErrorMessage', {
                message:
                  errorMessage.charAt(0).toLowerCase() + errorMessage.slice(1),
              })}
            </>
          ) : (
            translate('MovieSearchResultsLoadError')
          )}
        </Alert>
      ) : null}

      {!isFetching && isPopulated && !totalItems ? (
        <Alert kind={kinds.INFO} className={styles.alert}>
          {translate('NoResultsFound')}
        </Alert>
      ) : null}

      {!!totalItems && isPopulated && !items.length ? (
        <Alert kind={kinds.WARNING} className={styles.alert}>
          {translate('AllResultsHiddenFilter')}
        </Alert>
      ) : null}

      {isPopulated && !!items.length ? (
        <div className={styles.tableContainer}>
          <div ref={measureRef} className={styles.table}>
            <InteractiveSearchTableHeader
              columns={columns}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortPress={handleSortPress}
            />

            <VariableSizeList<RowItemData>
              ref={listRef}
              outerRef={listOuterRef}
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
              width={bounds.width}
              height={viewportHeight}
              itemCount={items.length}
              itemSize={getRowHeight}
              estimatedItemSize={ESTIMATED_ROW_HEIGHT}
              itemData={itemData}
              overscanCount={20}
            >
              {Row}
            </VariableSizeList>
          </div>
        </div>
      ) : null}

      {totalItems !== items.length && !!items.length ? (
        <Alert kind={kinds.INFO} className={styles.alert}>
          {translate('SomeResultsHiddenFilter')}
        </Alert>
      ) : null}
    </div>
  );
}

export default InteractiveSearch;
