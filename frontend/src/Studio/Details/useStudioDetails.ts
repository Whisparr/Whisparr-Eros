import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import * as commandNames from 'Commands/commandNames';
import type { IconName } from 'Components/Icon';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { icons } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchGeneralSettings } from 'Store/Actions/Settings/general';
import { toggleStudioScenesExpanded } from 'Store/Actions/studioScenesActions';
import Studio, { type CoverType, type Image } from 'Studio/Studio';

const PATH = 'studio';

/**
 * Hook to fetch and manage general application settings.
 * Dispatches the fetchGeneralSettings action on mount and returns the general settings state.
 *
 * @returns {AppState['settings']['general']['item']} The general settings object
 */
export function useGeneralSettings() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGeneralSettings());
  }, [dispatch]);

  return useSelector((state: AppState) => state.settings.general.item);
}

/**
 * Return type for the useStudioDetails hook.
 * Contains all state, derived data, and handlers needed to manage studio details UI.
 */
export interface UseStudioDetailsReturn {
  // State
  /** The studio object fetched from the API */
  studio?: Studio;
  /** Whether the studio details are currently being fetched */
  isStudioDetailsFetching: boolean;
  /** Whether a manual refresh was triggered by the user */
  isManualRefresh: boolean;
  /** Whether the studio is currently being refreshed */
  isStudioRefreshing: boolean;
  /** Whether safe for work mode is enabled */
  safeForWorkMode: boolean;
  /** Error that occurred while fetching studio details */
  studioDetailsError: Error | null;
  /** Whether the edit movie modal is open */
  isEditMovieModalOpen: boolean;
  /** Whether the delete movie modal is open */
  isDeleteMovieModalOpen: boolean;
  /** Tracks which years are expanded in the studio works list */
  expandedState: Record<number, boolean>;

  // Derived data
  /** Whether to show the movie monitor toggle based on metadata source settings */
  showMovieMonitorToggle: boolean;

  // Handlers
  /** Toggles the monitored state of the studio and/or its movies */
  onMonitorTogglePress: (
    value: boolean | { monitored: boolean; moviesMonitored: boolean },
    options: { shiftKey: boolean }
  ) => void;
  /** Triggers a refresh of the studio data */
  onRefreshPress: () => void;
  /** Triggers a search for the studio */
  onSearchPress: () => void;
  /** Triggers a refresh of movies in the given year(s) */
  onYearRefreshPress: (ids: number[]) => void;
  /** Closes the delete movie modal */
  handleDeleteMovieModalClose: () => void;
  /** Opens the delete movie modal */
  handleDeleteMoviePress: () => void;
  /** Closes the edit movie modal */
  handleEditMovieModalClose: () => void;
  /** Opens the edit movie modal */
  handleEditMoviePress: () => void;
  /** Toggles the expansion state of a specific year */
  handleExpandPress: (year: number) => void;
  /** Called when the title element is measured for layout calculations */
  handleTitleMeasure: (dimensions: { width: number; height: number }) => void;
}

/**
 * Processed studio works data organized by year.
 * Used by StudioDetails component to display movies grouped by release year.
 */
export interface StudioWorksData {
  years: number[];
  worksByYear: Array<{ year: number; works: Movie[] }>;
  runningYears: string;
  allExpanded: boolean;
  expandIcon: IconName;
  initialExpandedState: Record<number, boolean>;
}

/**
 * Main hook for managing studio details page state and interactions.
 * Fetches studio data, manages modal states, handles user actions, and coordinates
 * with Redux state management for expanded sections and refresh commands.
 *
 * @param {string} foreignId - The foreign ID of the studio to fetch details for
 * @returns {UseStudioDetailsReturn} State, derived data, and handler functions
 */
export const useStudioDetails = (foreignId: string): UseStudioDetailsReturn => {
  const dispatch = useDispatch();

  // Local state
  const safeForWorkMode = React.useContext(SafeForWorkModeContext);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [isEditMovieModalOpen, setIsEditMovieModalOpen] = useState(false);
  const [isDeleteMovieModalOpen, setIsDeleteMovieModalOpen] = useState(false);
  const prevStudioRef = useRef<Studio | undefined>();

  // Redux selectors for expanded state
  const expandedState = useSelector((state: AppState) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studioScenes = (state as any).studioScenes;
    return studioScenes?.expandedState ?? {};
  });

  // API calls
  const {
    data: studio,
    error: studioDetailsError,
    isFetching: studioDetailsFetching,
  } = useApiQuery<Studio>({
    path: `/${PATH}/${foreignId}`,
  });

  // Mutation for toggling monitored state
  // Uses a cache merge to avoid a re-fetch after toggling monitor state
  const monitorToggleMutation = useApiMutation<Studio, Studio>({
    method: 'PUT',
    path: studio?.id ? `/${PATH}/${studio.id}` : '',
    mutationOptions: {
      onSuccess: (data) => {
        if (data?.foreignId) {
          queryClient.setQueryData(
            [`/${PATH}/${data.foreignId}`],
            (oldData: Studio) => {
              if (!oldData || typeof oldData !== 'object') {
                return data;
              }
              return { ...oldData, ...data };
            }
          );
        }
      },
    },
  });

  // Redux selectors
  const isStudioRefreshing = useSelector((state: AppState) => {
    const commands = state.commands.items;
    return commands.some(
      (command) =>
        command.name === commandNames.REFRESH_STUDIO &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (command as any).studioIds?.includes(studio?.id)
    );
  });

  const generalSettings = useGeneralSettings();
  const studioId = studio?.id;

  // Cache studio data
  useEffect(() => {
    if (studio?.id) {
      queryClient.setQueryData([`/${PATH}/${studio.id}`], studio);
    }
  }, [studio, foreignId]);

  // Clear manual refresh flag when studio updates
  useEffect(() => {
    if (isManualRefresh && studio && prevStudioRef.current !== studio) {
      setIsManualRefresh(false);
    }
    prevStudioRef.current = studio;
  }, [studio, isManualRefresh]);

  // Determine if we should show the monitor toggle
  const showMovieMonitorToggle = useMemo(() => {
    return !!(
      (generalSettings?.whisparrMovieMetadataSource === 'tmdb' &&
        studio?.tmdbId &&
        studio.tmdbId > 0) ||
      (generalSettings?.whisparrMovieMetadataSource === 'tpdb' &&
        studio?.tpdbId &&
        studio.tpdbId.length > 0)
    );
  }, [
    generalSettings?.whisparrMovieMetadataSource,
    studio?.tmdbId,
    studio?.tpdbId,
  ]);

  // Handler: Refresh studio
  const onRefreshPress = useCallback(() => {
    if (!studioId) return;
    setIsManualRefresh(true);
    dispatch(
      executeCommand({
        name: commandNames.REFRESH_STUDIO,
        studioIds: [studioId],
      })
    );
  }, [studioId, dispatch]);

  // Handler: Search for studio
  const onSearchPress = useCallback(() => {
    if (!studioId) return;
    dispatch(
      executeCommand({
        name: commandNames.STUDIO_SEARCH,
        studioIds: [studioId],
      })
    );
  }, [studioId, dispatch]);

  // Handler: Toggle monitored state
  const onMonitorTogglePress = useCallback(
    (
      value: boolean | { monitored: boolean; moviesMonitored: boolean },
      _options: { shiftKey: boolean }
    ) => {
      if (!studio || !studioId) {
        throw new Error('Studio data not loaded');
      }
      // value is the entire toggle state object from MonitorToggleButton
      const toggleState =
        typeof value === 'boolean'
          ? { monitored: value, moviesMonitored: studio.moviesMonitored }
          : value;
      const updatedStudio = {
        ...studio,
        monitored: toggleState.monitored,
        moviesMonitored: toggleState.moviesMonitored,
      };
      monitorToggleMutation.mutate(updatedStudio);
    },
    [studio, studioId, monitorToggleMutation]
  );

  // Handler: Refresh movies in a year
  const onYearRefreshPress = useCallback(
    (ids: number[]) => {
      if (!studioId) return;
      setIsManualRefresh(true);
      dispatch(
        executeCommand({
          name: commandNames.REFRESH_MOVIE,
          movieIds: ids,
        })
      );
    },
    [studioId, dispatch]
  );

  // Handler: Open edit modal
  const handleEditMoviePress = useCallback(() => {
    setIsEditMovieModalOpen(true);
  }, []);

  // Handler: Open delete modal
  const handleDeleteMoviePress = useCallback(() => {
    setIsDeleteMovieModalOpen(true);
  }, []);

  // Handler: Close edit modal
  const handleEditMovieModalClose = useCallback(() => {
    setIsEditMovieModalOpen(false);
  }, []);

  // Handler: Close delete modal
  const handleDeleteMovieModalClose = useCallback(() => {
    setIsDeleteMovieModalOpen(false);
  }, []);

  // Handler: Title measure (placeholder)
  const handleTitleMeasure = useCallback(
    (_dimensions: { width: number; height: number }) => {
      // Used by Measure component, may be needed for responsive behavior
    },
    []
  );

  // Handler: Toggle expansion of a specific year
  const handleExpandPress = useCallback(
    (year: number) => {
      dispatch(toggleStudioScenesExpanded({ year }));
    },
    [dispatch]
  );

  return {
    studio,
    safeForWorkMode,
    isStudioDetailsFetching:
      studioDetailsFetching || monitorToggleMutation.isPending,
    isManualRefresh,
    isStudioRefreshing,
    studioDetailsError: (studioDetailsError ||
      monitorToggleMutation.error) as Error | null,
    isEditMovieModalOpen,
    isDeleteMovieModalOpen,
    expandedState,

    // Derived data
    showMovieMonitorToggle,

    // Handlers
    onRefreshPress,
    onSearchPress,
    onMonitorTogglePress,
    onYearRefreshPress,
    handleEditMoviePress,
    handleDeleteMoviePress,
    handleEditMovieModalClose,
    handleDeleteMovieModalClose,
    handleTitleMeasure,
    handleExpandPress,
  };
};

/**
 * Hook to fetch the list of works (movies/scenes) for a given studio.
 *
 * @param {string} studioForeignId - The foreign ID of the studio
 * @returns {UseQueryResult<Movie[]>} Query result containing the array of movies
 */
export function useStudioDetailsWorks(studioForeignId: string) {
  return useApiQuery<Movie[]>({
    path: `/${PATH}/${studioForeignId}/works`,
  });
}

/**
 * Hook to fetch studio movies table configuration from Redux state.
 * Returns the configured columns, sort key, and sort direction for the movies list.
 *
 * @returns {{columns: any[], sortKey: string, sortDirection: string}} Table configuration
 */
export function useStudioMoviesColumns() {
  return useSelector((state: AppState) => {
    // AppState isn't fully converted to TypeScript yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studioScenes = (state as any).studioScenes;
    return {
      columns: studioScenes?.columns ?? [],
      sortKey: studioScenes?.sortKey ?? 'releaseDate',
      sortDirection: studioScenes?.sortDirection ?? 'DESC',
    };
  });
}

/**
 * Hook to fetch tag label data for given tag IDs from Redux state.
 *
 * @param {number[]} tags - Array of tag IDs to look up
 * @returns {{id: number, label: string}[]} Array of tag objects with id and label
 */
export function useStudioTags(tags: number[]) {
  return useSelector((state: AppState) => {
    return state.tags.items
      .filter((tag) => tags.includes(tag.id))
      .map((tag) => ({ id: tag.id, label: tag.label }));
  });
}

/**
 * Validates and normalizes image objects to ensure proper typing.
 * Maps image coverType to valid CoverType values, defaulting to 'poster' for invalid types.
 *
 * @param {Array<{coverType: string, url: string, remoteUrl?: string}>} images - Array of image objects
 * @returns {Image[]} Array of properly typed Image objects
 */
export function ensureImageType(
  images: Array<{ coverType: string; url: string; remoteUrl?: string }>
): Image[] {
  return images.map((img) => ({
    coverType:
      img.coverType === 'poster' ||
      img.coverType === 'fanart' ||
      img.coverType === 'screenshot' ||
      img.coverType === 'clearlogo'
        ? (img.coverType as CoverType)
        : 'poster',
    url: img.url,
    remoteUrl: img.remoteUrl ?? '',
  }));
}

/**
 * Processes raw works data from the API and organizes it by year.
 * Calculates year ranges, determines expansion states, and provides icon indicators.
 * Used by StudioDetails component to group and display movies by release year.
 *
 * @param {Movie[]} allWorks - Array of all movies/works for the studio
 * @param {Record<number, boolean>} expandedState - Current expansion state of each year
 * @returns {StudioWorksData} Organized works data with year groupings and UI state
 */
export function buildStudioWorksData(
  allWorks: Movie[],
  expandedState: Record<number, boolean>
): StudioWorksData {
  const years = Array.from(
    new Set(allWorks.map((w) => w.year).filter((y): y is number => !!y))
  ).sort((a, b) => b - a);

  const worksByYear = years.map((year) => ({
    year,
    works: allWorks.filter((w) => w.year === year),
  }));

  const runningYears =
    years.length > 0 ? `${years[years.length - 1]}-${years[0]}` : '';

  const allExpanded =
    years.length > 0 && years.every((year) => expandedState[year]);

  let expandIcon = icons.EXPAND_INDETERMINATE;
  if (allExpanded) {
    expandIcon = icons.COLLAPSE;
  } else if (
    years.length > 0 &&
    Object.values(expandedState).every((val) => !val)
  ) {
    expandIcon = icons.EXPAND;
  }

  const initialExpandedState: Record<number, boolean> = {};
  years.forEach((year) => {
    initialExpandedState[year] = expandedState[year] ?? false;
  });

  return {
    years,
    worksByYear,
    runningYears,
    allExpanded,
    expandIcon,
    initialExpandedState,
  };
}
