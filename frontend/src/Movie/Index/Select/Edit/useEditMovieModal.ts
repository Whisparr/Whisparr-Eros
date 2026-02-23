import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import Movie from 'Movie/Movie';
import { setMovieValue } from 'Store/Actions/movieActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import { PendingSection } from 'typings/pending';

interface MovieSettings {
  monitored: boolean;
  qualityProfileId: number;
  minimumAvailability?: string;
  rootFolderPath: string;
  tags: number[];
  searchOnAdd?: boolean;
}

interface UseEditMovieModalResult {
  images: Movie['images'];
  overview?: string;
  isSaving: boolean;
  saveError: object | null;
  isPathChanging: boolean;
  originalPath: string;
  item: PendingSection<MovieSettings>;
  isSmallScreen: boolean;
  safeForWorkMode: boolean;
  onInputChange: (payload: { name: string; value: unknown }) => void;
  onSavePress: () => void;
}

export default function useEditMovieModal(
  movie: Movie
): UseEditMovieModalResult {
  const dispatch = useDispatch();

  // Get state from Redux
  const moviesState = useSelector((state: AppState) => state.movies);
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );
  const dimensions = useSelector(createDimensionsSelector());

  const { saveError, pendingChanges } = moviesState;

  // Check if path is changing
  const isPathChanging =
    pendingChanges.rootFolderPath != null &&
    movie.rootFolderPath !== pendingChanges.rootFolderPath;

  // Build settings
  const movieSettings: MovieSettings = {
    monitored: movie.monitored,
    qualityProfileId: movie.qualityProfileId,
    minimumAvailability: (
      movie as unknown as {
        minimumAvailability?: string;
      }
    ).minimumAvailability,
    rootFolderPath: movie.rootFolderPath,
    tags: movie.tags,
    searchOnAdd: (movie as unknown as { searchOnAdd?: boolean }).searchOnAdd,
  };

  const settings = selectSettings(movieSettings, pendingChanges, saveError);

  // Mutation for saving movie
  const saveMutation = useApiMutation<Movie, Movie>({
    method: 'PUT',
    path: `/movie/${movie.id}`,
    mutationOptions: {
      onSuccess: (data) => {
        if (data?.foreignId) {
          // Invalidate React Query cache for this movie
          queryClient.invalidateQueries({
            queryKey: [`/movie/${data.foreignId}`],
          });
          queryClient.invalidateQueries({
            queryKey: [`/movie/${data.foreignId}/works`],
          });
        }
      },
    },
  });

  // Handlers
  const onInputChange = useCallback(
    ({ name, value }: { name: string; value: unknown }) => {
      // @ts-expect-error - Redux action not fully typed yet
      dispatch(setMovieValue({ name, value }));
    },
    [dispatch]
  );

  const onSavePress = useCallback(() => {
    // Create updated movie object with pending changes
    const updatedMovie = {
      ...movie,
      ...pendingChanges,
    };
    saveMutation.mutate(updatedMovie);
  }, [movie, pendingChanges, saveMutation]);

  return {
    images: movie.images,
    overview: (movie as unknown as { overview?: string }).overview,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    isPathChanging,
    originalPath: (movie as unknown as { path?: string }).path || '',
    item: settings.settings,
    isSmallScreen: dimensions.isSmallScreen,
    safeForWorkMode,
    onInputChange,
    onSavePress,
  };
}
