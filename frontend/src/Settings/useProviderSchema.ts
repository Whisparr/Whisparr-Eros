import { useMemo } from 'react';
import ModelBase from 'App/ModelBase';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import Provider from 'typings/Provider';

type ProviderWithPresets<T> = T & {
  presets?: T[];
};

// What the add dialog hands to the edit modal: not the schema itself, but the
// coordinates to look it up once the schema query has resolved.
export interface SelectedSchema {
  implementation: string;
  implementationName: string;
  presetName?: string;
}

const NO_SCHEMA: readonly never[] = [];

export const useProviderSchema = <T extends ModelBase>(
  path: string,
  enabled = true
) => {
  const { isLoading, isFetched, error, data } = useApiQuery<T[]>({
    path: `${path}/schema`,
    queryOptions: {
      enabled,
    },
  });

  return {
    isSchemaLoading: isLoading,
    isSchemaFetched: isFetched,
    schemaError: error,
    schema: data ?? (NO_SCHEMA as Readonly<T[]>),
  };
};

export const useSelectedSchema = <T extends Provider>(
  path: string,
  selectedSchema: SelectedSchema | undefined
) => {
  const { schema } = useProviderSchema<T>(path, selectedSchema != null);

  return useMemo(() => {
    if (!selectedSchema) {
      return undefined;
    }

    const selected = schema.find(
      (s) => s.implementation === selectedSchema.implementation
    );

    // Still fetching, or the implementation went away between the pick and the
    // lookup. Callers gate their modal on the schema query, so this reads as
    // "not ready yet" rather than as an error.
    if (!selected) {
      return undefined;
    }

    if (selectedSchema.presetName == null) {
      return selected;
    }

    return (selected as ProviderWithPresets<T>).presets?.find(
      (preset) => preset.name === selectedSchema.presetName
    );
  }, [schema, selectedSchema]);
};
