import { useMemo } from 'react';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Quality from 'Quality/Quality';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';
import QualityProfile, { QualityProfileItem } from 'typings/QualityProfile';
import translate from 'Utilities/String/translate';

export const QUALITY_PROFILES_PATH = '/qualityprofile';
export const QUALITY_PROFILE_SCHEMA_PATH = '/qualityprofile/schema';

// The schema is one profile-shaped object rather than a list, so it never
// arrives through `useProviderSettings`. Everything outside this page wants it
// for the flat quality list alone, which is what `useQualities` returns.
const NO_SCHEMA = {} as QualityProfile;

export const useQualityProfiles = () => {
  return useProviderSettings<QualityProfile>(QUALITY_PROFILES_PATH);
};

export const useQualityProfile = (qualityProfileId: number) => {
  const { data } = useQualityProfiles();

  return data.find((profile) => profile.id === qualityProfileId);
};

export const useQualityProfileSchema = (enabled = true) => {
  const { isFetching, isFetched, error, data } = useApiQuery<QualityProfile>({
    path: QUALITY_PROFILE_SCHEMA_PATH,
    queryOptions: {
      enabled,
    },
  });

  return {
    isSchemaFetching: isFetching,
    isSchemaFetched: isFetched,
    schemaError: error,
    schema: data ?? NO_SCHEMA,
  };
};

function flattenQualities(items: QualityProfileItem[] | undefined) {
  if (!items) {
    return [];
  }

  return items.reduce<Quality[]>((acc, item) => {
    if (item.quality) {
      acc.push(item.quality);
    } else {
      acc.push(...item.items.map((groupItem) => groupItem.quality));
    }

    return acc;
  }, []);
}

// Replaces `Utilities/Quality/getQualities` -- every caller of that helper read
// the schema out of the slice first, so the fetch and the flattening travel
// together now.
export const useQualities = () => {
  const { schema, isSchemaFetching, isSchemaFetched, schemaError } =
    useQualityProfileSchema();

  const qualities = useMemo(() => flattenQualities(schema.items), [schema]);

  return {
    qualities,
    isFetching: isSchemaFetching,
    isFetched: isSchemaFetched,
    error: schemaError,
  };
};

export const useManageQualityProfile = (
  id: number | undefined,
  cloneId: number | undefined
) => {
  // Only a profile being added from scratch needs the schema; an edit reads the
  // row out of the list query and a clone reads the profile it is copying.
  const needsSchema = !id && cloneId == null;

  const { schema, isSchemaFetching, isSchemaFetched, schemaError } =
    useQualityProfileSchema(needsSchema);

  const profileToClone = useQualityProfile(cloneId ?? 0);

  // The clone action used to be a reducer that copied the source profile into
  // `pendingChanges`. It is the new profile's starting point instead, so a
  // clone that has been left untouched still saves as a copy.
  const defaultProfile = useMemo(() => {
    if (cloneId == null || !profileToClone) {
      return schema;
    }

    return {
      ...profileToClone,
      id: 0,
      name: translate('DefaultNameCopiedProfile', {
        name: profileToClone.name,
      }),
    };
  }, [cloneId, profileToClone, schema]);

  const manage = useManageProviderSettings<QualityProfile>(
    id ?? 0,
    defaultProfile,
    QUALITY_PROFILES_PATH
  );

  return {
    ...manage,
    isSchemaFetching: needsSchema ? isSchemaFetching : false,
    isSchemaFetched: needsSchema ? isSchemaFetched : true,
    schemaError: needsSchema ? schemaError : null,
  };
};

export const useDeleteQualityProfile = (id: number) => {
  const result = useDeleteProvider<QualityProfile>(id, QUALITY_PROFILES_PATH);

  return {
    ...result,
    deleteQualityProfile: result.deleteProvider,
  };
};
