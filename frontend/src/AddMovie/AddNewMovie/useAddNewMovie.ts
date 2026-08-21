import { useMutation } from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useAppDimension, useAppDimensions } from 'App/appStore';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import { ValidationMessage } from 'Components/Form/FormInputGroup';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { MovieStats } from 'Movie/Index/useMovieStats';
import Movie, { Image, Ratings } from 'Movie/Movie';
import { setAddMovieDefault } from 'Store/Actions/addMovieActions';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import { useSystemStatusData } from 'System/Status/useSystemStatus';
import { InputChanged } from 'typings/inputs';
import MovieCredit from 'typings/MovieCredit';
import { ValidationError, ValidationWarning } from 'typings/pending';
import fetchJson, { ApiError } from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import getNewMovie from 'Utilities/Movie/getNewMovie';
import parseUrl from 'Utilities/String/parseUrl';

// Lookup result shape returned by GET /movie/lookup
export interface MovieLookupResult {
  id: number;
  foreignId: string;
  tmdbId: number;
  tpdbId: string;
  title: string;
  titleSlug: string;
  year: number;
  itemType: string;
  status: string;
  overview: string;
  releaseDate: string;
  runtime: number;
  certification: string;
  website: string;
  images: Image[];
  ratings: Ratings;
  genres: string[];
  searchCredits: MovieCredit[];
  studioTitle: string;
  studioForeignId: string;
  folder: string;
  remotePoster: string;
  monitored: boolean;
  isAvailable: boolean;
  movieFile?: Movie['movieFile'];
  sizeOnDisk?: number;
  qualityProfileId: number;
  rootFolderPath: string;
  tags: number[];
  isExisting: boolean;
  isExcluded: boolean;
  addOptions?: Movie['addOptions'];
}

interface MovieDefaults {
  rootFolderPath: string;
  monitored: boolean;
  qualityProfileId: number;
  searchForMovie: boolean;
  tags: number[];
}

interface SettingValue<T> {
  value: T;
  errors?: ValidationMessage[];
  warnings?: ValidationMessage[];
  pending?: boolean;
  previousValue?: T;
}

interface AddMovieSettings {
  rootFolderPath: SettingValue<string>;
  monitored: SettingValue<boolean>;
  qualityProfileId: SettingValue<number>;
  searchForMovie: SettingValue<boolean>;
  tags: SettingValue<number[]>;
}

const defaultMovieDefaults: MovieDefaults = {
  rootFolderPath: '',
  monitored: true,
  qualityProfileId: 0,
  searchForMovie: false,
  tags: [],
};

const AUTH_HEADERS = {
  'X-Api-Key': window.Whisparr.apiKey,
  'X-Whisparr-Client': 'Whisparr',
};

function apiPost<T, TBody>(path: string, body: TBody): Promise<T> {
  return fetchJson<T, TBody>({
    path: getQueryPath(path),
    method: 'POST',
    body,
    headers: AUTH_HEADERS,
  });
}

// Hook for the AddNewMovie and AddNewScene pages
export function useAddNewMovie(itemType: 'movie' | 'scene') {
  const location = useLocation();
  const uiSettings = useSelector(createUISettingsSelector());

  // Initialise term from URL query param (e.g. ?term=foo) on first render
  const initialTerm = React.useMemo(() => {
    const parsed = parseUrl(location.search) as unknown as {
      params: Record<string, string>;
    };
    return parsed.params.term || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [term, setTerm] = useState(initialTerm);
  const [debouncedTerm, setDebouncedTerm] = useState(initialTerm);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stats query to determine whether any movies/scenes exist yet
  const { data: stats } = useApiQuery<MovieStats>({
    path: '/movie/stats',
    queryParams: { itemType },
  });

  const {
    data: items = [],
    isFetching,
    error,
  } = useApiQuery<MovieLookupResult[]>({
    path: '/movie/lookup',
    queryParams: { term: debouncedTerm, itemType },
    queryOptions: { enabled: !!debouncedTerm.trim() },
  });

  // Clear debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onLookupChange = useCallback((value: string) => {
    setTerm(value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (value.trim()) {
      timeoutRef.current = setTimeout(() => setDebouncedTerm(value), 300);
    } else {
      setDebouncedTerm('');
    }
  }, []);

  const onClearLookup = useCallback(() => {
    setTerm('');
    setDebouncedTerm('');
  }, []);

  return {
    term,
    items,
    isFetching: isFetching && !!debouncedTerm.trim(),
    error,
    hasExistingMovies: (stats?.totalCount ?? 0) > 0,
    colorImpairedMode: uiSettings.enableColorImpairedMode,
    onLookupChange,
    onClearLookup,
  };
}

// Hook for AddNewMovieSearchResult card (display settings)
export function useAddNewMovieSearchResult() {
  const dimensions = useAppDimensions();
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );
  const uiSettings = useSelector(createUISettingsSelector());

  return {
    isSmallScreen: dimensions.isSmallScreen,
    safeForWorkMode,
    shortDateFormat: uiSettings.shortDateFormat,
    showRelativeDates: uiSettings.showRelativeDates,
    timeFormat: uiSettings.timeFormat,
  };
}

// Hook for AddNewMovieModalContent (form + add mutation)
export function useAddMovieMutation(
  item: MovieLookupResult,
  onSuccess?: () => void
) {
  const dispatch = useDispatch();
  const isSmallScreen = useAppDimension('isSmallScreen');
  const systemStatus = useSystemStatusData();
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  // movieDefaults stay in Redux for persistence across page loads (ImportMovie also reads them)
  const addMovieState = useSelector(
    (
      state: AppState & {
        addMovie: { movieDefaults: MovieDefaults; addError?: ApiError };
      }
    ) => state.addMovie
  );

  const { movieDefaults = defaultMovieDefaults, addError } =
    addMovieState || {};

  const { settings, validationErrors, validationWarnings } = selectSettings(
    movieDefaults,
    {},
    addError
  ) as {
    settings: AddMovieSettings;
    validationErrors: ValidationError[];
    validationWarnings: ValidationWarning[];
  };

  const mutation = useMutation<Movie, ApiError, MovieLookupResult>({
    mutationFn: (movieToAdd: MovieLookupResult) => {
      return apiPost<Movie, MovieLookupResult>('/movie', movieToAdd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/movie/paged'] });
      queryClient.invalidateQueries({ queryKey: ['/movie/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/movie/lookup'] });
      onSuccess?.();
    },
  });

  const onInputChange = useCallback(
    (change: InputChanged) => {
      dispatch(setAddMovieDefault({ [change.name]: change.value }));
    },
    [dispatch]
  );

  const onAddMoviePress = useCallback(() => {
    const movieToAdd = getNewMovie(cloneDeep(item) as object, {
      rootFolderPath: settings.rootFolderPath.value,
      monitored: settings.monitored.value === true,
      qualityProfileId: settings.qualityProfileId.value,
      searchForMovie: settings.searchForMovie.value,
      tags: settings.tags.value,
    }) as MovieLookupResult;
    movieToAdd.id = 0;
    mutation.mutate(movieToAdd);
  }, [item, settings, mutation]);

  return {
    settings,
    validationErrors,
    validationWarnings,
    isAdding: mutation.isPending,
    addError: mutation.error,
    isSmallScreen,
    isWindows: systemStatus.isWindows,
    safeForWorkMode,
    onInputChange,
    onAddMoviePress,
  };
}
