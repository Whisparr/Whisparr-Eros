import React, { useCallback, useRef, useState } from 'react';
import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import {
  ImportAction,
  ImportItemType,
  MovieLookupResult,
} from './ImportMovieTypes';

interface QueueEntry {
  id: string;
  term: string;
  itemType?: ImportItemType;
}

interface UseImportLookupQueueResult {
  queueLookup: (entry: QueueEntry & { topOfQueue?: boolean }) => void;
  lookupUnsearched: (
    items: {
      id: string;
      term: string;
      itemType?: ImportItemType;
      isPopulated: boolean;
    }[]
  ) => void;
  cancelQueue: () => void;
  isLookingUp: boolean;
}

function useImportLookupQueue(
  dispatch: React.Dispatch<ImportAction>
): UseImportLookupQueueResult {
  const queueRef = useRef<QueueEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const processingRef = useRef(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) {
      if (queueRef.current.length === 0) {
        setIsLookingUp(false);
        dispatch({ type: 'SET_LOOKING_UP', value: false });
      }
      return;
    }

    processingRef.current = true;
    const entry = queueRef.current.shift()!;

    dispatch({ type: 'SET_ITEM_FETCHING', id: entry.id });
    dispatch({ type: 'SET_QUEUED', id: entry.id, queued: false });

    const controller = new AbortController();
    abortRef.current = controller;

    // An unset itemType is left off the query so the server infers it from
    // the file name rather than forcing a movie search.
    const params = new URLSearchParams({ term: entry.term });

    if (entry.itemType) {
      params.set('itemType', entry.itemType);
    }

    try {
      const results = await fetchJson<MovieLookupResult[], never>({
        path: getQueryPath(`/movie/lookup?${params.toString()}`),
        method: 'GET',
        headers: {
          'X-Api-Key': globalThis.Whisparr.apiKey,
          'X-Whisparr-Client': 'Whisparr',
        },
        signal: controller.signal,
      });

      dispatch({ type: 'SET_LOOKUP_RESULTS', id: entry.id, results });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        dispatch({
          type: 'SET_LOOKUP_ERROR',
          id: entry.id,
          error: err as Error,
        });
      }
    } finally {
      processingRef.current = false;
      abortRef.current = null;

      if (queueRef.current.length > 0) {
        processQueue();
      } else {
        setIsLookingUp(false);
        dispatch({ type: 'SET_LOOKING_UP', value: false });
      }
    }
  }, [dispatch]);

  const queueLookup = useCallback(
    (entry: QueueEntry & { topOfQueue?: boolean }) => {
      if (entry.term.length <= 2) {
        return;
      }

      // Remove any existing entry for this id
      const existingIdx = queueRef.current.findIndex((e) => e.id === entry.id);
      if (existingIdx >= 0) {
        queueRef.current.splice(existingIdx, 1);
      }

      const queueEntry: QueueEntry = {
        id: entry.id,
        term: entry.term,
        itemType: entry.itemType,
      };

      if (entry.topOfQueue) {
        // Abort the current in-flight lookup so the user's search takes priority
        abortRef.current?.abort();
        queueRef.current.unshift(queueEntry);
      } else {
        queueRef.current.push(queueEntry);
      }

      dispatch({ type: 'SET_QUEUED', id: entry.id, queued: true });

      if (!processingRef.current) {
        setIsLookingUp(true);
        dispatch({ type: 'SET_LOOKING_UP', value: true });
        processQueue();
      }
    },
    [dispatch, processQueue]
  );

  const lookupUnsearched = useCallback(
    (
      items: {
        id: string;
        term: string;
        itemType?: ImportItemType;
        isPopulated: boolean;
      }[]
    ) => {
      if (processingRef.current || queueRef.current.length > 0) {
        return;
      }

      items.forEach((item) => {
        if (!item.isPopulated) {
          queueRef.current.push({
            id: item.id,
            term: item.term,
            itemType: item.itemType,
          });
          dispatch({ type: 'SET_QUEUED', id: item.id, queued: true });
        }
      });

      if (queueRef.current.length > 0) {
        setIsLookingUp(true);
        dispatch({ type: 'SET_LOOKING_UP', value: true });
        processQueue();
      }
    },
    [dispatch, processQueue]
  );

  const cancelQueue = useCallback(() => {
    queueRef.current.splice(0);
    abortRef.current?.abort();
    abortRef.current = null;
    processingRef.current = false;
    setIsLookingUp(false);
    dispatch({ type: 'SET_LOOKING_UP', value: false });
  }, [dispatch]);

  return { queueLookup, lookupUnsearched, cancelQueue, isLookingUp };
}

export default useImportLookupQueue;
