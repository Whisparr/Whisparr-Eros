import React, { useCallback, useEffect, useRef, useState } from 'react';
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

function useImportLookupQueue(dispatch: React.Dispatch<ImportAction>) {
  const queueRef = useRef<QueueEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const processingRef = useRef(false);
  const generationRef = useRef(0);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current || !queueRef.current.length) {
      return;
    }

    processingRef.current = true;
    const generation = generationRef.current;
    setIsLookingUp(true);
    dispatch({ type: 'SET_LOOKING_UP', value: true });

    while (generation === generationRef.current && queueRef.current.length) {
      const entry = queueRef.current.shift()!;
      const controller = new AbortController();
      abortRef.current = controller;
      dispatch({ type: 'SET_ITEM_FETCHING', id: entry.id });
      dispatch({ type: 'SET_QUEUED', id: entry.id, queued: false });
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

        if (generation === generationRef.current) {
          dispatch({ type: 'SET_LOOKUP_RESULTS', id: entry.id, results });
        }
      } catch (error) {
        if (
          generation === generationRef.current &&
          (error as Error).name !== 'AbortError'
        ) {
          dispatch({
            type: 'SET_LOOKUP_ERROR',
            id: entry.id,
            error: error as Error,
          });
        }
      }
    }

    // An aborted worker must not clear the new page's worker or advance its queue.
    if (generation === generationRef.current) {
      processingRef.current = false;
      abortRef.current = null;
      setIsLookingUp(false);
      dispatch({ type: 'SET_LOOKING_UP', value: false });
    }
  }, [dispatch]);

  const cancelQueue = useCallback(() => {
    generationRef.current += 1;
    queueRef.current = [];
    abortRef.current?.abort();
    abortRef.current = null;
    processingRef.current = false;
    setIsLookingUp(false);
    dispatch({ type: 'CANCEL_LOOKUPS' });
  }, [dispatch]);

  useEffect(
    () => () => {
      generationRef.current += 1;
      queueRef.current = [];
      abortRef.current?.abort();
    },
    []
  );

  const queueLookup = useCallback(
    (entry: QueueEntry & { topOfQueue?: boolean }) => {
      if (entry.term.length <= 2) {
        return;
      }

      queueRef.current = queueRef.current.filter(
        (queued) => queued.id !== entry.id
      );

      if (entry.topOfQueue) {
        generationRef.current += 1;
        abortRef.current?.abort();
        processingRef.current = false;
        dispatch({ type: 'CANCEL_LOOKUPS' });
        queueRef.current.unshift(entry);
        queueRef.current.forEach(({ id }) =>
          dispatch({ type: 'SET_QUEUED', id, queued: true })
        );
      } else {
        queueRef.current.push(entry);
        dispatch({ type: 'SET_QUEUED', id: entry.id, queued: true });
      }

      processQueue();
    },
    [dispatch, processQueue]
  );

  const lookupUnsearched = useCallback(
    (items: (QueueEntry & { isPopulated: boolean })[]) => {
      if (!processingRef.current && !queueRef.current.length) {
        items.filter((item) => !item.isPopulated).forEach(queueLookup);
      }
    },
    [queueLookup]
  );

  return { queueLookup, lookupUnsearched, cancelQueue, isLookingUp };
}

export default useImportLookupQueue;
