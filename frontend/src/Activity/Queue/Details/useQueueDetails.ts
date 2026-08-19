import { useMemo } from 'react';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Queue from 'typings/Queue';

const DEFAULT_QUEUE_DETAILS: Queue[] = [];

// Sonarr wraps this in a context provider so each page can fetch a filtered
// slice. Our controller only binds `movieId` and `includeMovie` -- the `all`,
// `movieIds`, `time` and `view` params the redux thunk used to send were
// ignored, and every caller got the whole queue back. So there is one request
// and every consumer shares its cache entry.
export function useQueueDetails() {
  const { data } = useApiQuery<Queue[]>({
    path: '/queue/details',
  });

  return data ?? DEFAULT_QUEUE_DETAILS;
}

export function useQueueItemForMovie(movieId: number) {
  const queueDetails = useQueueDetails();

  return useMemo(() => {
    if (!movieId) {
      return null;
    }

    return queueDetails.find((item) => item.movieId === movieId) ?? null;
  }, [movieId, queueDetails]);
}

export interface MovieQueueDetails {
  count: number;
}

export function useQueueDetailsForMovie(movieId: number) {
  const queueDetails = useQueueDetails();

  return useMemo<MovieQueueDetails>(() => {
    return queueDetails.reduce(
      (acc: MovieQueueDetails, item) => {
        if (
          item.trackedDownloadState === 'imported' ||
          item.movieId !== movieId
        ) {
          return acc;
        }

        acc.count++;

        return acc;
      },
      { count: 0 }
    );
  }, [movieId, queueDetails]);
}
