import { useMemo } from 'react';
import { useGeneralSettings } from 'Settings/General/useGeneralSettings';
import translate from 'Utilities/String/translate';

export type MovieMonitorEntity = 'performer' | 'studio';

type LinkedMovieMetadataSource = 'tmdb' | 'tpdb';

// stashdb.org cross-references performers and studios to the movie metadata
// source by URL, so the example we point the user at has to match both the
// configured source and the kind of entity they're looking at.
const exampleUrls: Record<
  LinkedMovieMetadataSource,
  Record<MovieMonitorEntity, string>
> = {
  tmdb: {
    performer: 'https://www.themoviedb.org/person/1234567',
    studio: 'https://www.themoviedb.org/company/1234567',
  },
  tpdb: {
    performer: 'https://theporndb.net/performers/angela-white',
    studio: 'https://theporndb.net/sites/puretaboo',
  },
};

const sourceLabels: Record<LinkedMovieMetadataSource, string> = {
  tmdb: 'TMDb',
  tpdb: 'TPDb',
};

const messageKeys: Record<MovieMonitorEntity, string> = {
  performer: 'MovieMonitoringRequiresPerformerLink',
  studio: 'MovieMonitoringRequiresStudioLink',
};

export interface MovieMonitorAvailability {
  // The configured movie metadata source can supply movies at all.
  isSupported: boolean;
  // This entity carries the id that source needs to cross-reference it.
  isLinked: boolean;
  // Why monitoring is unavailable and how to fix it. Empty unless the source
  // is supported and the link is the thing that's missing.
  unavailableMessage: string;
}

export function getLinkedMovieMetadataSource(
  source?: string
): LinkedMovieMetadataSource | undefined {
  const normalized = source?.toLowerCase();

  return normalized === 'tmdb' || normalized === 'tpdb'
    ? normalized
    : undefined;
}

export function isMovieMetadataLinked(
  source: LinkedMovieMetadataSource,
  tmdbId?: number,
  tpdbId?: string
) {
  return source === 'tmdb' ? !!tmdbId && tmdbId > 0 : !!tpdbId?.length;
}

export function useMovieMonitorAvailability(
  entity: MovieMonitorEntity,
  tmdbId?: number,
  tpdbId?: string
): MovieMonitorAvailability {
  const { data: generalSettings } = useGeneralSettings();
  const source = generalSettings?.whisparrMovieMetadataSource;

  return useMemo(() => {
    const linkedSource = getLinkedMovieMetadataSource(source);

    if (!linkedSource) {
      return { isSupported: false, isLinked: false, unavailableMessage: '' };
    }

    const isLinked = isMovieMetadataLinked(linkedSource, tmdbId, tpdbId);

    return {
      isSupported: true,
      isLinked,
      unavailableMessage: isLinked
        ? ''
        : translate(messageKeys[entity], {
            source: sourceLabels[linkedSource],
            example: exampleUrls[linkedSource][entity],
          }),
    };
  }, [entity, source, tmdbId, tpdbId]);
}
