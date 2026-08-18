import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import useApiQuery from 'Helpers/Hooks/useApiQuery';

export interface QueueStatus {
  totalCount: number;
  count: number;
  unknownCount: number;
  errors: boolean;
  warnings: boolean;
  unknownErrors: boolean;
  unknownWarnings: boolean;
}

export default function useQueueStatus() {
  const { data } = useApiQuery<QueueStatus>({
    path: '/queue/status',
  });

  // Sonarr dropped this option and made it a queue filter instead, so their
  // hook always counts unknown items. Eros still has the checkbox, and it
  // still lives in `queue.options` alongside the paged fetch that reads it --
  // both move together when the paged section converts.
  const includeUnknownMovieItems = useSelector(
    (state: AppState) => state.queue.options.includeUnknownMovieItems
  );

  if (!data) {
    return {
      count: 0,
      errors: false,
      warnings: false,
    };
  }

  const {
    errors,
    warnings,
    unknownErrors,
    unknownWarnings,
    count,
    totalCount,
  } = data;

  return {
    count: includeUnknownMovieItems ? totalCount : count,
    errors: includeUnknownMovieItems ? errors || unknownErrors : errors,
    warnings: includeUnknownMovieItems ? warnings || unknownWarnings : warnings,
  };
}
