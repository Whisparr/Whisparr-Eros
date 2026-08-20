import { DateFilterValue } from 'Helpers/Props/filterTypes';
import { Error } from './AppSectionState';
import CaptchaAppState from './CaptchaAppState';
import CommandAppState from './CommandAppState';
import ExtraFilesAppState from './ExtraFilesAppState';
import InteractiveImportAppState from './InteractiveImportAppState';
import MessagesAppState from './MessagesAppState';
import MovieCollectionAppState from './MovieCollectionAppState';
import MovieCreditAppState from './MovieCreditAppState';
import MovieFilesAppState from './MovieFilesAppState';
import MoviesAppState, { MovieIndexAppState } from './MoviesAppState';
import OAuthAppState from './OAuthAppState';
import PathsAppState from './PathsAppState';
import PerformersAppState from './PerformersAppState';
import ProviderOptionsAppState from './ProviderOptionsAppState';
import ReleasesAppState from './ReleasesAppState';
import RootFolderAppState from './RootFolderAppState';
import SettingsAppState from './SettingsAppState';
import StudiosAppState from './StudiosAppState';
import TagsAppState from './TagsAppState';

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
  messages: MessagesAppState;
}

interface AppState {
  app: AppSectionState;
  captcha: CaptchaAppState;
  commands: CommandAppState;
  extraFiles: ExtraFilesAppState;
  interactiveImport: InteractiveImportAppState;
  movieCollections: MovieCollectionAppState;
  movieCredits: MovieCreditAppState;
  movieFiles: MovieFilesAppState;
  movieIndex: MovieIndexAppState;
  sceneIndex: MovieIndexAppState;
  performers: PerformersAppState;
  studios: StudiosAppState;
  movies: MoviesAppState;
  oAuth: OAuthAppState;
  paths: PathsAppState;
  providerOptions: ProviderOptionsAppState;
  releases: ReleasesAppState;
  rootFolders: RootFolderAppState;
  settings: SettingsAppState;
  tags: TagsAppState;
}

export default AppState;
