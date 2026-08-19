import { useQueryClient } from '@tanstack/react-query';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import Movie from 'Movie/Movie';

interface ToggleMoviesMonitoredData {
  movieIds: number[];
  monitored: boolean;
}

// The redux handler marked every affected row `isSaving` while the request was
// in flight and the pages then spun the toolbar button when more than one row
// carried the flag -- so toggling a single movie never spun at all. The
// mutation's own pending state replaces both, and `isSaving` leaves the record
// type with it.
export default function useToggleMoviesMonitored(path: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useApiMutation<
    Movie[],
    ToggleMoviesMonitoredData
  >({
    path: '/movie/editor',
    method: 'PUT',
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [path] });
      },
    },
  });

  return { toggleMoviesMonitored: mutate, isToggling: isPending };
}
