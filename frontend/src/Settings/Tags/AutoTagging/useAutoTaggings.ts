import { useCallback, useMemo } from 'react';
import { useProviderSchema } from 'Settings/useProviderSchema';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';
import AutoTagging, { AutoTaggingSpecification } from 'typings/AutoTagging';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';

export const AUTO_TAGGINGS_PATH = '/autoTagging';

const DEFAULT_AUTO_TAGGING: AutoTagging = {
  id: 0,
  name: '',
  removeTagsAutomatically: false,
  tags: [],
  specifications: [],
};

export const useAutoTaggings = () => {
  return useProviderSettings<AutoTagging>(AUTO_TAGGINGS_PATH);
};

export const useSortedAutoTaggings = () => {
  const result = useAutoTaggings();

  const data = useMemo(
    () => [...result.data].sort(sortByProp('name')),
    [result.data]
  );

  return { ...result, data };
};

export const useAutoTaggingsWithIds = (ids: number[]) => {
  const { data } = useAutoTaggings();

  return useMemo(
    () => data.filter((autoTagging) => ids.includes(autoTagging.id)),
    [data, ids]
  );
};

// The conditions the server offers, which is also the type of a single
// condition once one is picked: `/autoTagging/schema` returns a list of
// `AutoTaggingSpecification`, not of auto tags.
export const useAutoTaggingSchema = (enabled = true) => {
  return useProviderSchema<AutoTaggingSpecification>(
    AUTO_TAGGINGS_PATH,
    enabled
  );
};

export const useDeleteAutoTagging = (id: number) => {
  const { deleteProvider, ...result } = useDeleteProvider<AutoTagging>(
    id,
    AUTO_TAGGINGS_PATH
  );

  return {
    ...result,
    deleteAutoTagging: deleteProvider,
  };
};

function getNextSpecificationId(specifications: AutoTaggingSpecification[]) {
  return specifications.length
    ? Math.max(...specifications.map((s) => s.id)) + 1
    : 1;
}

// A clone starts from the auto tag it copies, minus the id so it saves as a new
// one. Unlike an indexer clone there is nothing to mask -- a condition's fields
// hold match patterns, never secrets.
const cloneAutoTagging = (autoTagging: AutoTagging): AutoTagging => {
  return {
    ...autoTagging,
    id: 0,
    name: translate('DefaultNameCopiedProfile', { name: autoTagging.name }),
  };
};

export const useManageAutoTagging = (id?: number, cloneId?: number) => {
  const { data } = useAutoTaggings();

  const autoTaggingToClone = useMemo(() => {
    return cloneId == null
      ? undefined
      : data.find((autoTagging) => autoTagging.id === cloneId);
  }, [data, cloneId]);

  const defaultAutoTagging = useMemo(() => {
    return autoTaggingToClone
      ? cloneAutoTagging(autoTaggingToClone)
      : DEFAULT_AUTO_TAGGING;
  }, [autoTaggingToClone]);

  const { testProvider, isTesting, ...manage } =
    useManageProviderSettings<AutoTagging>(
      id ?? 0,
      defaultAutoTagging,
      AUTO_TAGGINGS_PATH
    );

  const { updateValue } = manage;

  // Conditions are not a resource. They live inside the auto tag, the server
  // never sends them an id -- `AutoTaggingSpecificationSchema` leaves `Id` at
  // its default and the serialiser drops it -- and they reach the API only as
  // part of the auto tag's own PUT. So the ids below are assigned here, for
  // React to key the cards on and for the handlers to name one by, and the
  // whole list rides in `specifications` as a single pending change. That is
  // what the `settings.autoTaggingSpecifications` slice was: a staging area
  // with one endpoint, `/autoTagging/schema`, and no writes of its own.
  const specifications = useMemo(() => {
    return manage.item.specifications.value.map((specification, index) => ({
      ...specification,
      id: specification.id || index + 1,
    }));
  }, [manage.item.specifications.value]);

  const saveSpecification = useCallback(
    (specification: AutoTaggingSpecification) => {
      const isExisting = specifications.some((s) => s.id === specification.id);

      updateValue(
        'specifications',
        isExisting
          ? specifications.map((s) =>
              s.id === specification.id ? specification : s
            )
          : [
              ...specifications,
              {
                ...specification,
                id: getNextSpecificationId(specifications),
              },
            ]
      );
    },
    [specifications, updateValue]
  );

  const deleteSpecification = useCallback(
    (specificationId: number) => {
      updateValue(
        'specifications',
        specifications.filter((s) => s.id !== specificationId)
      );
    },
    [specifications, updateValue]
  );

  const cloneSpecification = useCallback(
    (specificationId: number) => {
      const specification = specifications.find(
        (s) => s.id === specificationId
      );

      if (!specification) {
        return;
      }

      updateValue('specifications', [
        ...specifications,
        {
          ...specification,
          id: getNextSpecificationId(specifications),
          name: translate('DefaultNameCopiedSpecification', {
            name: specification.name,
          }),
        },
      ]);
    },
    [specifications, updateValue]
  );

  return {
    ...manage,
    saveAutoTagging: manage.saveProvider,
    specifications,
    saveSpecification,
    deleteSpecification,
    cloneSpecification,
  };
};
