export interface ImportFile {
  name: string;
  path: string;
  relativePath: string;
}

export interface MovieLookupResult {
  foreignId: string;
  tmdbId: number;
  tpdbId?: string;
  itemType: 'movie' | 'scene';
  title: string;
  year: number;
  releaseDate?: string;
  studioTitle?: string;
  isExisting: boolean;
}

export interface ImportItem {
  id: string;
  path: string;
  relativePath: string;
  term: string;
  itemType: 'movie' | 'scene';
  isFetching: boolean;
  isPopulated: boolean;
  isQueued: boolean;
  error: Error | null;
  items: MovieLookupResult[];
  selectedMovie: MovieLookupResult | null;
  monitor: string;
  qualityProfileId: number;
}

export type ImportAction =
  | {
      type: 'INIT_ITEMS';
      files: ImportFile[];
      itemType: 'movie' | 'scene';
      defaults: { monitor: string; qualityProfileId: number };
    }
  | { type: 'SET_ITEM_FETCHING'; id: string }
  | {
      type: 'SET_LOOKUP_RESULTS';
      id: string;
      results: MovieLookupResult[];
    }
  | { type: 'SET_LOOKUP_ERROR'; id: string; error: Error }
  | { type: 'SET_SELECTED_MOVIE'; id: string; movie: MovieLookupResult | null }
  | {
      type: 'SET_ITEM_VALUE';
      id: string;
      key: 'monitor' | 'qualityProfileId';
      value: string | number;
    }
  | { type: 'SET_QUEUED'; id: string; queued: boolean }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'SET_LOOKING_UP'; value: boolean };

export interface ImportState {
  isLookingUp: boolean;
  items: ImportItem[];
}

export const IMPORT_ITEM_LIMIT = 500;

export function importReducer(
  state: ImportState,
  action: ImportAction
): ImportState {
  switch (action.type) {
    case 'INIT_ITEMS': {
      const sliced = action.files.slice(0, IMPORT_ITEM_LIMIT);
      return {
        isLookingUp: false,
        items: sliced.map((f) => ({
          id: f.name,
          path: f.path,
          relativePath: f.relativePath,
          term: f.name,
          itemType: action.itemType,
          isFetching: false,
          isPopulated: false,
          isQueued: false,
          error: null,
          items: [],
          selectedMovie: null,
          monitor: action.defaults.monitor,
          qualityProfileId: action.defaults.qualityProfileId,
        })),
      };
    }

    case 'SET_ITEM_FETCHING':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, isFetching: true } : item
        ),
      };

    case 'SET_LOOKUP_RESULTS':
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.id) {
            return item;
          }
          const selectedMovie = item.selectedMovie ?? action.results[0] ?? null;
          return {
            ...item,
            isFetching: false,
            isPopulated: true,
            isQueued: false,
            error: null,
            items: action.results,
            selectedMovie,
          };
        }),
      };

    case 'SET_LOOKUP_ERROR':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? {
                ...item,
                isFetching: false,
                isPopulated: false,
                isQueued: false,
                error: action.error,
              }
            : item
        ),
      };

    case 'SET_SELECTED_MOVIE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, selectedMovie: action.movie }
            : item
        ),
      };

    case 'SET_ITEM_VALUE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, [action.key]: action.value } : item
        ),
      };

    case 'SET_QUEUED':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, isQueued: action.queued } : item
        ),
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };

    case 'SET_LOOKING_UP':
      return { ...state, isLookingUp: action.value };

    default:
      return state;
  }
}
