import { useMutation } from '@tanstack/react-query';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDimension, useAppDimensions } from 'App/appStore';
import { queryClient } from 'App/queryClient';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import { ValidationMessage } from 'Components/Form/FormInputGroup';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import selectSettings from 'Helpers/selectSettings';
import { MovieStats } from 'Movie/Index/useMovieStats';
import Movie, { Image, Ratings } from 'Movie/Movie';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import { useSystemStatusData } from 'System/Status/useSystemStatus';
import { InputChanged } from 'typings/inputs';
import MovieCredit from 'typings/MovieCredit';
import { ValidationError, ValidationWarning } from 'typings/pending';
import fetchJson, { ApiError } from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';
import getNewMovie from 'Utilities/Movie/getNewMovie';
import parseUrl from 'Utilities/String/parseUrl';
import {
  AddMovieDefaults,
  setAddMovieDefault,
  useAddMovieDefaults,
} from '../addMovieDefaultsStore';

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
  const uiSettings = useUiSettingsValues();

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
  const safeForWorkMode = useSafeForWorkMode();
  const uiSettings = useUiSettingsValues();

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
  const isSmallScreen = useAppDimension('isSmallScreen');
  const systemStatus = useSystemStatusData();
  const safeForWorkMode = useSafeForWorkMode();

  const defaults = useAddMovieDefaults();

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

  // The add thunk used to stash its failure on the slice; the mutation carries
  // it now, so a 400 from POST /movie lands on the field it names again.
  const { settings, validationErrors, validationWarnings } = useMemo(
    () =>
      selectSettings(defaults, {}, mutation.error) as {
        settings: AddMovieSettings;
        validationErrors: ValidationError[];
        validationWarnings: ValidationWarning[];
      },
    [defaults, mutation.error]
  );

  const onInputChange = useCallback(({ name, value }: InputChanged) => {
    setAddMovieDefault(
      name as keyof AddMovieDefaults,
      value as AddMovieDefaults[keyof AddMovieDefaults]
    );
  }, []);

  const onAddMoviePress = useCallback(() => {
    mutation.mutate({
      ...getNewMovie(item, {
        rootFolderPath: settings.rootFolderPath.value,
        monitored: settings.monitored.value === true,
        qualityProfileId: settings.qualityProfileId.value,
        searchForMovie: settings.searchForMovie.value,
        tags: settings.tags.value,
      }),
      id: 0,
    });
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
