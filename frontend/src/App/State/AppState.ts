import { DateFilterValue } from 'Helpers/Props/filterTypes';
import { Error } from './AppSectionState';
import ExtraFilesAppState from './ExtraFilesAppState';
import InteractiveImportAppState from './InteractiveImportAppState';
import MovieCollectionAppState from './MovieCollectionAppState';
import MovieCreditAppState from './MovieCreditAppState';
import MovieFilesAppState from './MovieFilesAppState';
import MoviesAppState from './MoviesAppState';
import PerformersAppState from './PerformersAppState';
import ReleasesAppState from './ReleasesAppState';
import SettingsAppState from './SettingsAppState';

interface FilterBuilderPropOption {
  id: string;
  name: string;
}

export interface FilterBuilderProp<T> {
  name: string;
  label: string;
  type: string;
  valueType?: string;
  optionsSelector?: (items: T[]) => FilterBuilderPropOption[];
}

export interface PropertyFilter {
  key: string;
  // Predefined filters in the Store/Actions files carry scalar booleans and
  // numbers; custom filters come from React Query typed by Filters/Filter,
  // which adds boolean arrays and date values. Both end up here.
  value:
    | boolean
    | string
    | number
    | string[]
    | number[]
    | boolean[]
    | DateFilterValue;
  type: string;
}

export interface Filter {
  key: string;
  label: string | (() => string);
  filters: PropertyFilter[];
}

// Custom filters come from React Query, which types them with the definition
// in Filters/Filter. Re-exported here so the many components that import their
// prop types from AppState keep working.
export type { CustomFilter } from 'Filters/Filter';

export interface AppSectionState {
  isUpdated: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  isRestarting: boolean;
  version: string;
  prevVersion?: string;
  dimensions: {
    isSmallScreen: boolean;
    isLargeScreen: boolean;
    width: number;
    height: number;
  };
  translations: {
    error?: Error;
    isPopulated: boolean;
  };
  isSidebarVisible?: boolean;
}

interface AppState {
  extraFiles: ExtraFilesAppState;
  interactiveImport: InteractiveImportAppState;
  movieCollections: MovieCollectionAppState;
  movieCredits: MovieCreditAppState;
  movieFiles: MovieFilesAppState;
  performers: PerformersAppState;
  movies: MoviesAppState;
  releases: ReleasesAppState;
  settings: SettingsAppState;
}

export default AppState;
