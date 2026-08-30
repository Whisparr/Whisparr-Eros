import { useMemo, useState } from 'react';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Language from 'Language/Language';
import { QualityModel } from 'Quality/Quality';
import Release from 'typings/Release';
import clientSideFilterAndSort from 'Utilities/Filter/clientSideFilterAndSort';
import translate from 'Utilities/String/translate';
import InteractiveSearchPayload from './InteractiveSearchPayload';
import { RELEASE_FILTER_PREDICATES, RELEASE_FILTERS } from './releaseFilters';
import { useReleaseFilterKey, useReleaseSort } from './releaseOptionsStore';

export const RELEASE_PATH = '/release';

const DEFAULT_RELEASES: Release[] = [];

// Every clause the slice kept. `rejections` and `releaseWeight` both push
// rejected releases to the bottom rather than sorting on the rejection itself,
// which is what makes the download column's sort mean "best first".
const SORT_PREDICATES = {
  age: (item: Release) => item.ageMinutes,

  peers: (item: Release) => {
    const seeders = item.seeders || 0;
    const leechers = item.leechers || 0;

    return seeders * 1000000 + leechers;
  },

  languages: (item: Release) => {
    if (item.languages.length > 1) {
      return 10000;
    }

    return item.languages[0]?.id ?? 0;
  },

  indexerFlags: (item: Release) =>
    item.indexerFlags.length === 0
      ? item.releaseWeight + 1000000
      : item.releaseWeight,

  rejections: (item: Release) =>
    item.rejections.length === 0
      ? item.releaseWeight
      : item.releaseWeight + 1000000,

  releaseWeight: (item: Release) =>
    item.rejections.length === 0
      ? item.releaseWeight
      : item.releaseWeight + 1000000,
};

export function useReleases(payload: InteractiveSearchPayload) {
  const selectedFilterKey = useReleaseFilterKey();
  const { sortKey, sortDirection } = useReleaseSort();
  const customFilters = useCustomFiltersList('releases');

  const { data, isFetching, isFetched, isError, error } = useApiQuery<
    Release[]
  >({
    path: RELEASE_PATH,
    queryParams: { ...payload },
    queryOptions: {
      // A search is only meaningful while the modal is open, and dropping the
      // query on close is what aborts a search still in flight -- the two
      // things `cancelFetchReleases` and `clearReleases` did between them.
      gcTime: 0,
      refetchOnWindowFocus: false,
      retry: false,
    },
  });

  const releases = data ?? DEFAULT_RELEASES;

  const { data: items, totalItems } = useMemo(() => {
    return clientSideFilterAndSort(releases, {
      selectedFilterKey,
      filters: RELEASE_FILTERS,
      filterPredicates: RELEASE_FILTER_PREDICATES,
      customFilters,
      sortKey,
      sortDirection,
      sortPredicates: SORT_PREDICATES,
    });
  }, [releases, selectedFilterKey, customFilters, sortKey, sortDirection]);

  return {
    releases,
    items,
    totalItems,
    isFetching,
    // A failed search is not an empty one. The thunk left `isPopulated` false
    // when the request failed, which is what kept "No results found" from
    // rendering underneath the error.
    isPopulated: isFetched && !isError,
    error,
    selectedFilterKey,
    sortKey,
    sortDirection,
    customFilters,
  };
}

export interface GrabReleasePayload {
  guid: string;
  indexerId: number;
  movieId?: number;
  quality?: QualityModel;
  languages?: Language[];
  downloadClientId?: number | null;
  shouldOverride?: boolean;
}

// One per row, replacing the `isGrabbing` / `isGrabbed` / `grabError` fields the
// slice wrote onto the release itself. The override modal shares the row's
// instance rather than opening a second one, so both buttons report the same
// grab.
export function useGrabRelease() {
  const [isGrabbed, setIsGrabbed] = useState(false);

  const { mutate, isPending, error } = useApiMutation<
    unknown,
    GrabReleasePayload
  >({
    path: RELEASE_PATH,
    method: 'POST',
    mutationOptions: {
      onMutate: () => setIsGrabbed(false),
      onSuccess: () => setIsGrabbed(true),
    },
  });

  const grabError = useMemo(() => {
    if (!error) {
      return undefined;
    }

    return (
      (error.statusBody as { message?: string } | undefined)?.message ??
      translate('InteractiveSearchGrabError')
    );
  }, [error]);

  return {
    grabRelease: mutate,
    isGrabbing: isPending,
    isGrabbed,
    grabError,
  };
}
