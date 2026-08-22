import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';
import { SortDirection } from 'Helpers/Props/sortDirections';
import ImportMode from './ImportMode';

export interface InteractiveImportOptions {
  sortKey: string;
  sortDirection: SortDirection;
  importMode: ImportMode;
}

// Replaces the `interactiveImport.sortKey` / `.sortDirection` / `.importMode`
// entries of `persistState`. The table's columns are not here: the slice never
// persisted them, and their visibility is computed per open from `showMovie`
// and whether any item carries indexer flags.
const { useOptions, getOptions, setOption, setSort } =
  createOptionsStore<InteractiveImportOptions>(
    'interactive_import_options',
    () => ({
      sortKey: 'relativePath',
      sortDirection: 'ascending',
      importMode: 'chooseImportMode',
    })
  );

export const useInteractiveImportOptions = useOptions;
export const getInteractiveImportOptions = getOptions;
export const setInteractiveImportSort = setSort;

export const setInteractiveImportMode = (importMode: ImportMode) => {
  setOption('importMode', importMode);
};
