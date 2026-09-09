import { useGeneralSettings } from 'Settings/General/useGeneralSettings';
import {
  getLinkedMovieMetadataSource,
  isMovieMetadataLinked,
} from './useMovieMonitorAvailability';

export function useShowMovieMonitorToggleButton(
  tmdbid?: number,
  tpdbid?: string
) {
  const { data: generalSettings } = useGeneralSettings();
  const linkedSource = getLinkedMovieMetadataSource(
    generalSettings?.whisparrMovieMetadataSource
  );

  return !!linkedSource && isMovieMetadataLinked(linkedSource, tmdbid, tpdbid);
}
