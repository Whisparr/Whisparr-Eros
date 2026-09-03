import { useMemo } from 'react';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import translate from 'Utilities/String/translate';

export interface QualityProfileInUse {
  movieCount: number;
  performerCount: number;
  studioCount: number;
  importListCount: number;
  isFallback: boolean;
}

const NOT_IN_USE: QualityProfileInUse = {
  movieCount: 0,
  performerCount: 0,
  studioCount: 0,
  importListCount: 0,
  isFallback: false,
};

// Replaces `createProfileInUseSelector('qualityProfileId')`, which only ever
// answered for quality profiles, and only for the import-list term.
//
// The server refuses the delete on a movie, performer, studio or import list
// using the profile, or on the fallback flag. Sonarr answers the equivalent
// question by fetching every series; here that is the whole library --
// `GET /movie` alone measured 46MB of JSON -- so the counts are asked for
// instead (Whisparr/Whisparr#1138).
function useQualityProfileInUse(id: number | undefined) {
  const { data } = useApiQuery<QualityProfileInUse>({
    path: `/qualityprofile/${id ?? 0}/inuse`,
    queryOptions: {
      enabled: !!id,
    },
  });

  return useMemo(() => {
    const inUse = id ? (data ?? NOT_IN_USE) : NOT_IN_USE;

    const usedBy = [
      { count: inUse.movieCount, label: translate('Movies') },
      { count: inUse.performerCount, label: translate('Performers') },
      { count: inUse.studioCount, label: translate('Studios') },
      { count: inUse.importListCount, label: translate('ImportLists') },
    ].filter(({ count }) => count > 0);

    const messages: string[] = [];

    if (usedBy.length) {
      messages.push(
        translate('QualityProfileInUseBy', {
          types: usedBy.map(({ label }) => label).join(', '),
        })
      );
    }

    if (inUse.isFallback) {
      messages.push(translate('QualityProfileInUseFallback'));
    }

    return {
      isInUse: usedBy.length > 0 || inUse.isFallback,
      inUseMessage: messages.join(' '),
    };
  }, [id, data]);
}

export default useQualityProfileInUse;
