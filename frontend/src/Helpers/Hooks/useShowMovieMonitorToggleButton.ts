import { useGeneralSettings } from '../../Settings/General/useGeneralSettings';

export function useShowMovieMonitorToggleButton(
  tmdbid?: number,
  tpdbid?: string
) {
  const generalSettings = useGeneralSettings();
  const source = generalSettings.whisparrMovieMetadataSource;

  switch (true) {
    case source === 'none':
      return false;
    case source === 'tmdb' && tmdbid && tmdbid > 0:
      return true;
    case source === 'tpdb' && tpdbid && tpdbid.length > 0:
      return true;
    default:
      return false;
  }
}
