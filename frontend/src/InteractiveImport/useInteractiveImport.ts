import { useCallback, useEffect, useMemo, useState } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Language from 'Language/Language';
import { QualityModel } from 'Quality/Quality';
import clientSideFilterAndSort from 'Utilities/Filter/clientSideFilterAndSort';
import naturalExpansion from 'Utilities/String/naturalExpansion';
import InteractiveImport from './InteractiveImport';
import { useInteractiveImportOptions } from './interactiveImportOptionsStore';

export const MANUAL_IMPORT_PATH = '/manualimport';

const DEFAULT_ITEMS: InteractiveImport[] = [];

const SORT_PREDICATES = {
  relativePath: (item: InteractiveImport) =>
    naturalExpansion(item.relativePath.toLowerCase()),
  movie: (item: InteractiveImport) => item.movie?.sortTitle ?? '',
  quality: (item: InteractiveImport) => item.qualityWeight || 0,
  customFormats: (item: InteractiveImport) => item.customFormatScore,
};

export interface InteractiveImportParams {
  downloadId?: string;
  movieId?: number;
  folder?: string;
  filterExistingFiles?: boolean;
}

interface ReprocessInteractiveImportItem {
  id: number;
  path: string;
  movieId: number | undefined;
  quality: QualityModel | undefined;
  languages: Language[] | undefined;
  releaseGroup: string | undefined;
  indexerFlags: number;
  downloadId: string | undefined;
}

type ItemChanges = Record<number, Partial<InteractiveImport>>;

/**
 * The manual import list, plus the edits the user has made to it.
 *
 * The edits are kept beside the fetched rows rather than written over them,
 * because the import needs both: the merged rows are what gets sent, and the
 * untouched ones are how `isSameMovieFile` decides whether an existing file can
 * be updated in place instead of re-imported. The slice kept a second copy of
 * the response in `originalItems` for the same reason.
 */
export default function useInteractiveImport(params: InteractiveImportParams) {
  const { sortKey, sortDirection } = useInteractiveImportOptions();
  const [changes, setChanges] = useState<ItemChanges>({});

  const { downloadId, movieId, folder, filterExistingFiles } = params;

  const {
    data,
    isFetching,
    isFetched,
    error: fetchError,
  } = useApiQuery<InteractiveImport[]>({
    path: MANUAL_IMPORT_PATH,
    queryParams: { downloadId, movieId, folder, filterExistingFiles },
    queryOptions: {
      // The list is only meaningful while the modal is open, and a stale one
      // would be handed straight back the next time it opens.
      gcTime: 0,
      refetchOnWindowFocus: false,
    },
  });

  const originalItems = data ?? DEFAULT_ITEMS;

  // Switching between all files and unmapped files fetches a different list, so
  // the edits made against the old one no longer apply.
  useEffect(() => {
    setChanges({});
  }, [filterExistingFiles]);

  const mergedItems = useMemo(() => {
    return originalItems.map((item) =>
      changes[item.id] ? { ...item, ...changes[item.id] } : item
    );
  }, [originalItems, changes]);

  const { data: items } = useMemo(() => {
    return clientSideFilterAndSort(mergedItems, {
      sortKey,
      sortDirection,
      sortPredicates: SORT_PREDICATES,
    });
  }, [mergedItems, sortKey, sortDirection]);

  const { mutate: reprocess, isPending: isReprocessing } = useApiMutation<
    InteractiveImport[],
    ReprocessInteractiveImportItem[]
  >({
    path: MANUAL_IMPORT_PATH,
    method: 'POST',
    mutationOptions: {
      onSuccess: (reprocessedItems) => {
        setChanges((previous) => {
          const next = { ...previous };

          reprocessedItems.forEach(({ id, ...rest }) => {
            next[id] = { ...next[id], ...rest };
          });

          return next;
        });
      },
    },
  });

  // Every change to a row is a change the server has to re-evaluate -- picking a
  // movie changes the rejections, picking a quality changes the score -- so
  // recording the edit and asking for it to be reprocessed is one operation.
  const updateItems = useCallback(
    (ids: number[], updates: Partial<InteractiveImport>) => {
      setChanges((previous) => {
        const next = { ...previous };

        ids.forEach((id) => {
          next[id] = { ...next[id], ...updates };
        });

        return next;
      });

      const payload = ids.reduce<ReprocessInteractiveImportItem[]>(
        (acc, id) => {
          const current = mergedItems.find((i) => i.id === id);

          if (!current) {
            return acc;
          }

          const item = { ...current, ...updates };

          acc.push({
            id,
            path: item.path,
            movieId: item.movie?.id,
            quality: item.quality,
            languages: item.languages,
            releaseGroup: item.releaseGroup,
            indexerFlags: item.indexerFlags,
            downloadId: item.downloadId,
          });

          return acc;
        },
        []
      );

      if (payload.length) {
        reprocess(payload);
      }
    },
    [mergedItems, reprocess]
  );

  return {
    items,
    originalItems,
    isFetching,
    isFetched,
    isReprocessing,
    error: fetchError,
    updateItems,
  };
}
