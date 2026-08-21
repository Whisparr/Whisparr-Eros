import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppDimensions } from 'App/appStore';
import AppState from 'App/State/AppState';
import Movie from 'Movie/Movie';
import { setMovieValue } from 'Store/Actions/movieActions';
import selectSettings from 'Store/Selectors/selectSettings';
import { PendingSection } from 'typings/pending';

interface MovieSettings {
  monitored: boolean;
  qualityProfileId: number;
  rootFolderPath: string;
  tags: number[];
}

interface UseEditMovieModalResult {
  images: Movie['images'];
  isPathChanging: boolean;
  item: PendingSection<MovieSettings>;
  isSmallScreen: boolean;
  safeForWorkMode: boolean;
  onInputChange: (payload: { name: string; value: unknown }) => void;
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
  const dimensions = useAppDimensions();

  const { saveError, pendingChanges } = moviesState;

  // Check if path is changing
  const isPathChanging =
    pendingChanges.rootFolderPath != null &&
    movie.rootFolderPath !== pendingChanges.rootFolderPath;

  // Build settings
  const movieSettings: MovieSettings = {
    monitored: movie.monitored,
    qualityProfileId: movie.qualityProfileId,
    rootFolderPath: movie.rootFolderPath,
    tags: movie.tags,
  };

  const settings = selectSettings(movieSettings, pendingChanges, saveError);

  // Handlers
  const onInputChange = useCallback(
    ({ name, value }: { name: string; value: unknown }) => {
      // @ts-expect-error - Redux action not fully typed yet
      dispatch(setMovieValue({ name, value }));
    },
    [dispatch]
  );

  return {
    images: movie.images,
    isPathChanging,
    item: settings.settings,
    isSmallScreen: dimensions.isSmallScreen,
    safeForWorkMode,
    onInputChange,
  };
}
