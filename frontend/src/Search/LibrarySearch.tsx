import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SelectProvider } from 'App/SelectContext';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import TablePager from 'Components/Table/TablePager';
import Movie from 'Movie/Movie';
import Performer from 'Performer/Performer';
import Studio from 'Studio/Studio';
import translate from 'Utilities/String/translate';
import SearchPosterGrid from './SearchPosterGrid';
import useLibrarySearch, {
  LibrarySearchResult,
  LibrarySearchType,
  useLibrarySearchPage,
} from './useLibrarySearch';
import styles from './LibrarySearch.css';

// How many of each type the All tab shows before "See all".
const ALL_TAB_LIMIT = 12;
const PAGE_SIZE = 50;

interface TypeInfo {
  type: LibrarySearchType;
  key: keyof LibrarySearchResult;
  labelKey: string;
  addPath: string;
}

const TYPES: TypeInfo[] = [
  {
    type: 'performer',
    key: 'performers',
    labelKey: 'Performers',
    addPath: '/add/new/performer',
  },
  {
    type: 'studio',
    key: 'studios',
    labelKey: 'Studios',
    addPath: '/add/new/studio',
  },
  {
    type: 'scene',
    key: 'scenes',
    labelKey: 'Scenes',
    addPath: '/add/new/scene',
  },
  {
    type: 'movie',
    key: 'movies',
    labelKey: 'Movies',
    addPath: '/add/new/movie',
  },
];

const ADD_LABEL_KEYS: Record<LibrarySearchType, string> = {
  performer: 'AddNewPerformer',
  studio: 'AddNewStudio',
  scene: 'AddNewScene',
  movie: 'AddNewMovie',
};

function isSearchType(value: string | null): value is LibrarySearchType {
  return TYPES.some((t) => t.type === value);
}

function getSearchPath(term: string, type?: LibrarySearchType) {
  const params = new URLSearchParams({ term });

  if (type) {
    params.set('type', type);
  }

  return `/search?${params.toString()}`;
}

function getTotal(summary: LibrarySearchResult | undefined) {
  return TYPES.reduce(
    (total, { key }) => total + (summary?.[key].totalRecords ?? 0),
    0
  );
}

interface ResultsProps {
  type: LibrarySearchType;
  items: readonly (Movie | Performer | Studio)[];
}

// Each search type's endpoint returns only that type, so the casts hold.
function Results({ type, items }: Readonly<ResultsProps>) {
  switch (type) {
    case 'performer':
      return (
        <SearchPosterGrid type={type} items={items as readonly Performer[]} />
      );
    case 'studio':
      return (
        <SearchPosterGrid type={type} items={items as readonly Studio[]} />
      );
    default:
      return <SearchPosterGrid type={type} items={items as readonly Movie[]} />;
  }
}

function LibrarySearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const term = searchParams.get('term') ?? '';
  const typeParam = searchParams.get('type');
  const selectedType = isSearchType(typeParam) ? typeParam : null;
  const page = Math.max(
    Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    1
  );

  const { data: summary, isFetching: isFetchingSummary } = useLibrarySearch(
    term,
    ALL_TAB_LIMIT,
    1
  );

  const { data: typePage, isFetching: isFetchingPage } = useLibrarySearchPage(
    selectedType ?? 'scene',
    term,
    page,
    PAGE_SIZE,
    selectedType != null
  );

  const total = useMemo(() => getTotal(summary), [summary]);
  const totalPages = typePage
    ? Math.max(Math.ceil(typePage.totalRecords / PAGE_SIZE), 1)
    : 1;

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((params) => {
        params.set('page', `${nextPage}`);
        return params;
      });
    },
    [setSearchParams]
  );

  const handleFirstPagePress = useCallback(() => setPage(1), [setPage]);
  const handlePreviousPagePress = useCallback(
    () => setPage(Math.max(page - 1, 1)),
    [page, setPage]
  );
  const handleNextPagePress = useCallback(
    () => setPage(Math.min(page + 1, totalPages)),
    [page, totalPages, setPage]
  );
  const handleLastPagePress = useCallback(
    () => setPage(totalPages),
    [totalPages, setPage]
  );

  const movies = useMemo(
    () => [
      ...(summary?.scenes.records ?? []),
      ...(summary?.movies.records ?? []),
    ],
    [summary]
  );

  return (
    <PageContent
      title={term ? `${translate('Search')}: ${term}` : translate('Search')}
    >
      <PageContentBody>
        <SelectProvider items={movies as Movie[]}>
          {term ? null : (
            <div className={styles.message}>
              {translate('LibrarySearchHint')}
            </div>
          )}

          {term && summary ? (
            <>
              <div className={styles.summary}>
                {translate('LibrarySearchResultCount', { total, term })}
              </div>

              <ul className={styles.tabList}>
                <li>
                  <Link
                    className={selectedType ? styles.tab : styles.selectedTab}
                    to={getSearchPath(term)}
                  >
                    {translate('All')}
                    <span className={styles.count}>{total}</span>
                  </Link>
                </li>

                {TYPES.map(({ type, key, labelKey }) => (
                  <li key={type}>
                    <Link
                      className={
                        selectedType === type ? styles.selectedTab : styles.tab
                      }
                      to={getSearchPath(term, type)}
                    >
                      {translate(labelKey)}
                      <span className={styles.count}>
                        {summary[key].totalRecords}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {term && isFetchingSummary && !summary ? <LoadingIndicator /> : null}

          {term && summary && total === 0 ? (
            <div>
              <div className={styles.message}>
                {translate('CouldNotFindResults', { term })}
              </div>

              <div className={styles.addLinks}>
                {TYPES.map(({ type, addPath }) => (
                  <Link
                    key={type}
                    to={`${addPath}?term=${encodeURIComponent(term)}`}
                  >
                    {translate(ADD_LABEL_KEYS[type])}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {term && summary && total > 0 && !selectedType
            ? TYPES.filter(({ key }) => summary[key].totalRecords > 0).map(
                ({ type, key, labelKey }) => (
                  <section key={type} className={styles.section}>
                    <div className={styles.sectionHeader}>
                      {translate(labelKey)}

                      {summary[key].totalRecords > ALL_TAB_LIMIT ? (
                        <Link
                          className={styles.seeAll}
                          to={getSearchPath(term, type)}
                        >
                          {translate('SeeAllCount', {
                            count: summary[key].totalRecords,
                          })}
                        </Link>
                      ) : null}
                    </div>

                    <Results type={type} items={summary[key].records} />
                  </section>
                )
              )
            : null}

          {term && selectedType ? (
            <>
              {isFetchingPage && !typePage ? <LoadingIndicator /> : null}

              {typePage ? (
                <>
                  <Results type={selectedType} items={typePage.records} />

                  <TablePager
                    page={page}
                    totalPages={totalPages}
                    totalRecords={typePage.totalRecords}
                    isFetching={isFetchingPage}
                    onFirstPagePress={handleFirstPagePress}
                    onPreviousPagePress={handlePreviousPagePress}
                    onNextPagePress={handleNextPagePress}
                    onLastPagePress={handleLastPagePress}
                    onPageSelect={setPage}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </SelectProvider>
      </PageContentBody>
    </PageContent>
  );
}

export default LibrarySearch;
