import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { ExtraFile } from './ExtraFile';

// Fetch all movie files for a movieId
function useExtraFile(movieId: number | undefined) {
  return useApiQuery<ExtraFile[] | undefined>({
    path: '/extrafile',
    queryOptions: { enabled: !!movieId },
    queryParams: { movieId },
  });
}

export default useExtraFile;
