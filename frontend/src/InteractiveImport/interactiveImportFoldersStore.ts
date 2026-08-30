import moment from 'moment';
import { createPersist } from 'Helpers/createPersist';
import sortByProp from 'Utilities/Array/sortByProp';

const MAXIMUM_RECENT_FOLDERS = 10;

export interface RecentFolder {
  folder: string;
  lastUsed: string;
}

export interface FavoriteFolder {
  folder: string;
}

interface InteractiveImportFoldersState {
  recentFolders: RecentFolder[];
  favoriteFolders: FavoriteFolder[];
}

// Replaces the `interactiveImport.recentFolders` / `.favoriteFolders` entries of
// `persistState`. Both survived `clearInteractiveImport`, so they are the only
// part of the slice that was genuinely long-lived.
const store = createPersist<InteractiveImportFoldersState>(
  'interactive_import_folders',
  () => ({
    recentFolders: [],
    favoriteFolders: [],
  })
);

export const useRecentFolders = () => store((state) => state.recentFolders);

export const useFavoriteFolders = () => store((state) => state.favoriteFolders);

export const addRecentFolder = (folder: string) => {
  store.setState((state) => {
    const recentFolders = state.recentFolders.filter(
      (r) => r.folder !== folder
    );

    recentFolders.push({ folder, lastUsed: moment().toISOString() });

    const sliceIndex = Math.max(
      recentFolders.length - MAXIMUM_RECENT_FOLDERS,
      0
    );

    return { ...state, recentFolders: recentFolders.slice(sliceIndex) };
  });
};

export const removeRecentFolder = (folder: string) => {
  store.setState((state) => ({
    ...state,
    recentFolders: state.recentFolders.filter((r) => r.folder !== folder),
  }));
};

export const addFavoriteFolder = (folder: string) => {
  store.setState((state) => ({
    ...state,
    favoriteFolders: [...state.favoriteFolders, { folder }].sort(
      sortByProp('folder')
    ),
  }));
};

export const removeFavoriteFolder = (folder: string) => {
  store.setState((state) => ({
    ...state,
    favoriteFolders: state.favoriteFolders.filter((f) => f.folder !== folder),
  }));
};
