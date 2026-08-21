import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { queryClient } from 'App/queryClient';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import * as commandNames from 'Commands/commandNames';
import useCommands, { useExecuteCommand } from 'Commands/useCommands';
import type { IconName } from 'Components/Icon';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { icons } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import Studio, { type CoverType, type Image } from 'Studio/Studio';
import { useToggleStudioMonitored } from 'Studio/useStudio';
import { useTagList } from 'Tags/useTags';
import {
  toggleStudioScenesExpanded,
  useStudioScenesOption,
} from './studioScenesOptionsStore';

const PATH = 'studio';

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
  const executeCommand = useExecuteCommand();

  // Local state
  const safeForWorkMode = React.useContext(SafeForWorkModeContext);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [isEditMovieModalOpen, setIsEditMovieModalOpen] = useState(false);
  const [isDeleteMovieModalOpen, setIsDeleteMovieModalOpen] = useState(false);
  const prevStudioRef = useRef<Studio | undefined>(undefined);

  const expandedState = useStudioScenesOption('expandedState');

  // API calls
  const {
    data: studio,
    error: studioDetailsError,
    isFetching: studioDetailsFetching,
  } = useApiQuery<Studio>({
    path: `/${PATH}/${foreignId}`,
  });

  const monitorToggleMutation = useToggleStudioMonitored();

  // Matching stays exactly as the slice had it, including reading `studioIds` off the
  // command rather than its body.
  const { data: allCommands } = useCommands();

  const isStudioRefreshing = allCommands.some(
    (command) =>
      command.name === commandNames.REFRESH_STUDIO &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (command as any).studioIds?.includes(studio?.id)
  );

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

  // Handler: Refresh studio
  const onRefreshPress = useCallback(() => {
    if (!studioId) return;
    setIsManualRefresh(true);
    executeCommand({
      name: commandNames.REFRESH_STUDIO,
      studioIds: [studioId],
    });
  }, [studioId, executeCommand]);

  // Handler: Search for studio
  const onSearchPress = useCallback(() => {
    if (!studioId) return;
    executeCommand({
      name: commandNames.STUDIO_SEARCH,
      studioIds: [studioId],
    });
  }, [studioId, executeCommand]);

  // Handler: Toggle monitored state
  const onMonitorTogglePress = useCallback(
    (
      value: boolean | { monitored: boolean; moviesMonitored: boolean },
      _options: { shiftKey: boolean }
    ) => {
      if (!studio || !studioId) {
        throw new Error('Studio data not loaded');
      }
      const toggleState =
        typeof value === 'boolean'
          ? { monitored: value, moviesMonitored: studio.moviesMonitored }
          : value;
      monitorToggleMutation.mutate({
        studioId,
        foreignId: studio.foreignId,
        monitored: toggleState.monitored,
        moviesMonitored: toggleState.moviesMonitored,
      });
    },
    [studio, studioId, monitorToggleMutation]
  );

  // Handler: Refresh movies in a year
  const onYearRefreshPress = useCallback(
    (ids: number[]) => {
      if (!studioId) return;
      setIsManualRefresh(true);
      executeCommand({
        name: commandNames.REFRESH_MOVIE,
        movieIds: ids,
      });
    },
    [studioId, executeCommand]
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
  const handleExpandPress = useCallback((year: number) => {
    toggleStudioScenesExpanded(year);
  }, []);

  return {
    studio,
    safeForWorkMode,
    isStudioDetailsFetching:
      studioDetailsFetching || monitorToggleMutation.isPending,
    isManualRefresh,
    isStudioRefreshing,
    studioDetailsError: studioDetailsError || monitorToggleMutation.error,
    isEditMovieModalOpen,
    isDeleteMovieModalOpen,
    expandedState,

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
 * Hook to fetch tag label data for given tag IDs.
 *
 * @param {number[]} tags - Array of tag IDs to look up
 * @returns {{id: number, label: string}[]} Array of tag objects with id and label
 */
export function useStudioTags(tags: number[]) {
  const tagList = useTagList();

  return useMemo(
    () =>
      tagList
        .filter((tag) => tags.includes(tag.id))
        .map((tag) => ({ id: tag.id, label: tag.label })),
    [tagList, tags]
  );
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
  allWorks: readonly Movie[],
  expandedState: Record<number, boolean>
): StudioWorksData {
  const years = Array.from(
    new Set(allWorks.map((w) => w.year).filter((y): y is number => !!y))
  ).sort((a, b) => b - a);

  const worksByYear = years.map((year) => ({
    year,
    works: allWorks.filter((w) => w.year === year),
  }));

  const runningYears = years.length > 0 ? `${years.at(-1)}-${years[0]}` : '';

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
