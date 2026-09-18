import Movie from 'Movie/Movie';
import { useNamingSettings } from 'Settings/MediaManagement/Naming/useNamingSettings';
import translate from 'Utilities/String/translate';

// Whether a performer's or studio's works have anything Preview Rename could
// act on: at least one file, with renaming turned on for movies or scenes.
function useOrganizeAvailability(works: readonly Movie[]) {
  const {
    data: { renameMovies, renameScenes },
  } = useNamingSettings();

  const hasFiles = works.some((work) => work.hasFile);
  const isRenamingEnabled = renameMovies || renameScenes;
  const canRename = hasFiles && isRenamingEnabled;

  return {
    canRename,
    title:
      hasFiles && !isRenamingEnabled
        ? translate('OrganizeRenamingDisabled')
        : translate('PreviewRename'),
  };
}

export default useOrganizeAvailability;
