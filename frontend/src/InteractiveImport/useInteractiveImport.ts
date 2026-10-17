import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { PagedQueryResponse } from 'Helpers/Hooks/usePagedApiQuery';
import Language from 'Language/Language';
import { QualityModel } from 'Quality/Quality';
import InteractiveImport from './InteractiveImport';
import { useInteractiveImportOptions } from './interactiveImportOptionsStore';

export const MANUAL_IMPORT_PATH = '/manualimport';

const DEFAULT_ITEMS: ReadonlyArray<InteractiveImport> = [];

export interface InteractiveImportParams {
  downloadIds?: string[];
  movieId?: number;
  folder?: string;
  filterExistingFiles?: boolean;
  page: number;
  pageSize: number;
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

  const { downloadIds, movieId, folder, filterExistingFiles, page, pageSize } =
    params;
  const scope = JSON.stringify([
    downloadIds,
    movieId,
    folder,
    filterExistingFiles,
  ]);
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const [cache, setCache] = useState<{
    scope: string;
    rows: InteractiveImport[];
  }>({ scope, rows: [] });

  const {
    data,
    isFetching,
    isFetched,
    error: fetchError,
  } = useApiQuery<PagedQueryResponse<InteractiveImport>>({
    path: `${MANUAL_IMPORT_PATH}/paged`,
    queryParams: {
      downloadIds,
      movieId,
      folder,
      filterExistingFiles,
      page,
      pageSize,
      sortKey: ['relativePath', 'size'].includes(sortKey)
        ? sortKey
        : 'relativePath',
      sortDirection,
    },
    queryOptions: {
      // The list is only meaningful while the modal is open, and a stale one
      // would be handed straight back the next time it opens.
      gcTime: 0,
      placeholderData: undefined,
      refetchOnWindowFocus: false,
    },
  });

  const originalItems = useMemo(() => {
    const rows = new Map(
      (cache.scope === scope ? cache.rows : DEFAULT_ITEMS).map((item) => [
        item.id,
        item,
      ])
    );
    data?.records.forEach((item) => rows.set(item.id, item));
    return Array.from(rows.values());
  }, [cache, scope, data]);

  useEffect(() => {
    if (data) {
      setCache((previous) => {
        const rows = new Map(
          (previous.scope === scope ? previous.rows : DEFAULT_ITEMS).map(
            (item) => [item.id, item]
          )
        );
        data.records.forEach((item) => rows.set(item.id, item));
        return { scope, rows: Array.from(rows.values()) };
      });
    }
  }, [data, scope]);

  useEffect(() => {
    setChanges({});
  }, [scope]);

  const mergedItems = useMemo(() => {
    return originalItems.map((item) =>
      changes[item.id] ? { ...item, ...changes[item.id] } : item
    );
  }, [originalItems, changes]);

  const pageItems = useMemo(() => {
    const byId = new Map(mergedItems.map((item) => [item.id, item]));
    return (data?.records ?? DEFAULT_ITEMS).map((item) => byId.get(item.id)!);
  }, [data, mergedItems]);
  const totalRecords = data?.totalRecords ?? 0;

  const { mutate: reprocess, isPending: isReprocessing } = useApiMutation<
    InteractiveImport[],
    { scope: string; items: ReprocessInteractiveImportItem[] },
    ReprocessInteractiveImportItem[]
  >({
    path: MANUAL_IMPORT_PATH,
    method: 'POST',
    body: (request) => request.items,
    mutationOptions: {
      onSuccess: (reprocessedItems, request) => {
        if (currentScope.current !== request.scope) return;
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
        reprocess({ scope, items: payload });
      }
    },
    [mergedItems, reprocess, scope]
  );

  return {
    items: mergedItems,
    pageItems,
    totalRecords,
    originalItems,
    isFetching,
    isFetched,
    isReprocessing,
    error: fetchError,
    updateItems,
  };
}
