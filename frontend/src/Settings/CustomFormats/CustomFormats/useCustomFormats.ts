import { useCallback, useMemo } from 'react';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useQueryClient from 'Helpers/Hooks/useQueryClient';
import { useProviderSchema } from 'Settings/useProviderSchema';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';
import CustomFormat, { CustomFormatSpecification } from 'typings/CustomFormat';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';

export const CUSTOM_FORMATS_PATH = '/customformat';

const DEFAULT_CUSTOM_FORMAT: CustomFormat = {
  id: 0,
  name: '',
  includeCustomFormatWhenRenaming: false,
  specifications: [],
};

export const useCustomFormats = () => {
  return useProviderSettings<CustomFormat>(CUSTOM_FORMATS_PATH);
};

export const useSortedCustomFormats = () => {
  const result = useCustomFormats();

  const data = useMemo(
    () => [...result.data].sort(sortByProp('name')),
    [result.data]
  );

  return { ...result, data };
};

// The conditions the server offers, which is also the type of a single
// condition once one is picked: `/customformat/schema` returns a list of
// `CustomFormatSpecification`, not of custom formats.
export const useCustomFormatSpecificationSchema = (enabled = true) => {
  return useProviderSchema<CustomFormatSpecification>(
    CUSTOM_FORMATS_PATH,
    enabled
  );
};

export const useDeleteCustomFormat = (id: number) => {
  const { deleteProvider, ...result } = useDeleteProvider<CustomFormat>(
    id,
    CUSTOM_FORMATS_PATH
  );

  return {
    ...result,
    deleteCustomFormat: deleteProvider,
  };
};

function getNextSpecificationId(specifications: CustomFormatSpecification[]) {
  return specifications.length
    ? Math.max(...specifications.map((s) => s.id)) + 1
    : 1;
}

// A clone starts from the format it copies, minus the id so it saves as a new
// one, and it carries the conditions across -- which is what cloning a format
// is for. There is nothing to mask: a condition's fields hold match patterns,
// never secrets.
const cloneCustomFormat = (customFormat: CustomFormat): CustomFormat => {
  return {
    ...customFormat,
    id: 0,
    name: translate('DefaultNameCopiedProfile', { name: customFormat.name }),
  };
};

export const useManageCustomFormat = (id?: number, cloneId?: number) => {
  const { data } = useCustomFormats();

  const customFormatToClone = useMemo(() => {
    return cloneId == null
      ? undefined
      : data.find((customFormat) => customFormat.id === cloneId);
  }, [data, cloneId]);

  const defaultCustomFormat = useMemo(() => {
    return customFormatToClone
      ? cloneCustomFormat(customFormatToClone)
      : DEFAULT_CUSTOM_FORMAT;
  }, [customFormatToClone]);

  const { testProvider, isTesting, ...manage } =
    useManageProviderSettings<CustomFormat>(
      id ?? 0,
      defaultCustomFormat,
      CUSTOM_FORMATS_PATH
    );

  const { updateValue } = manage;

  // Conditions are not a resource. They live inside the custom format, the
  // server never sends them an id, and they reach the API only as part of the
  // format's own POST or PUT. So the ids below are assigned here, for React to
  // key the cards on and for the handlers to name one by, and the whole list
  // rides in `specifications` as a single pending change. That is what the
  // `settings.customFormatSpecifications` slice was: a staging area with one
  // endpoint, `/customformat/schema`, and no writes of its own.
  const specifications = useMemo(() => {
    return manage.item.specifications.value.map(
      (specification: CustomFormatSpecification, index: number) => ({
        ...specification,
        id: specification.id || index + 1,
      })
    );
  }, [manage.item.specifications.value]);

  const setSpecifications = useCallback(
    (updated: CustomFormatSpecification[]) => {
      updateValue('specifications', updated);
    },
    [updateValue]
  );

  const saveSpecification = useCallback(
    (specification: CustomFormatSpecification) => {
      const isExisting = specifications.some(
        (s: CustomFormatSpecification) => s.id === specification.id
      );

      setSpecifications(
        isExisting
          ? specifications.map((s: CustomFormatSpecification) =>
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
    [specifications, setSpecifications]
  );

  const deleteSpecification = useCallback(
    (specificationId: number) => {
      setSpecifications(
        specifications.filter(
          (s: CustomFormatSpecification) => s.id !== specificationId
        )
      );
    },
    [specifications, setSpecifications]
  );

  const cloneSpecification = useCallback(
    (specificationId: number) => {
      const specification = specifications.find(
        (s: CustomFormatSpecification) => s.id === specificationId
      );

      if (!specification) {
        return;
      }

      setSpecifications([
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
    [specifications, setSpecifications]
  );

  return {
    ...manage,
    saveCustomFormat: manage.saveProvider,
    specifications,
    setSpecifications,
    saveSpecification,
    deleteSpecification,
    cloneSpecification,
  };
};

export interface BulkEditCustomFormats {
  ids: number[];
  includeCustomFormatWhenRenaming?: boolean;
}

export const useBulkEditCustomFormats = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<
    CustomFormat[],
    BulkEditCustomFormats
  >({
    path: `${CUSTOM_FORMATS_PATH}/bulk`,
    method: 'PUT',
    mutationOptions: {
      onSuccess: (updatedCustomFormats) => {
        queryClient.setQueryData<CustomFormat[]>(
          [CUSTOM_FORMATS_PATH],
          (customFormats = []) => {
            return customFormats.map((customFormat) => {
              return (
                updatedCustomFormats.find(
                  (updated) => updated.id === customFormat.id
                ) ?? customFormat
              );
            });
          }
        );
      },
    },
  });

  return {
    bulkEditCustomFormats: mutate,
    isSaving: isPending,
    saveError: error,
  };
};

export const useBulkDeleteCustomFormats = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<void, { ids: number[] }>({
    path: `${CUSTOM_FORMATS_PATH}/bulk`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: (_data, { ids }) => {
        queryClient.setQueryData<CustomFormat[]>(
          [CUSTOM_FORMATS_PATH],
          (customFormats = []) => {
            return customFormats.filter(
              (customFormat) => !ids.includes(customFormat.id)
            );
          }
        );
      },
    },
  });

  const bulkDeleteCustomFormats = useCallback(
    (ids: number[]) => mutate({ ids }),
    [mutate]
  );

  return {
    bulkDeleteCustomFormats,
    isDeleting: isPending,
    deleteError: error,
  };
};
