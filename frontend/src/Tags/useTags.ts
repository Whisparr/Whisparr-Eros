import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import ModelBase from 'App/ModelBase';
import useApiMutation, {
  getValidationFailures,
} from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import { ValidationFailures } from 'Helpers/selectSettings';
import sortByProp from 'Utilities/Array/sortByProp';

export interface Tag extends ModelBase {
  label: string;
}

export const TAGS_QUERY_KEY = ['/tag'];

const DEFAULT_TAGS: Tag[] = [];

const useTags = () => {
  const result = useApiQuery<Tag[]>({
    path: '/tag',
    // Tags only change through this app's own mutations, and both of them write
    // their result straight into the cache below. The default staleTime would
    // refetch the list every time one of the ~20 consumers mounts a new
    // observer, where the slice it replaces fetched once for the session.
    queryOptions: { staleTime: Infinity },
  });

  return {
    ...result,
    data: result.data ?? DEFAULT_TAGS,
  };
};

export default useTags;

export const useTagList = () => {
  const { data } = useTags();

  return data;
};

export const useSortedTagList = () => {
  const tagList = useTagList();

  // Copy before sorting. The slice handed out a fresh array per fetch, so the
  // in-place sorts that grew up around it were harmless; the query cache hands
  // out the same array to every consumer.
  return useMemo(() => [...tagList].sort(sortByProp('label')), [tagList]);
};

export const useAddTag = (onTagCreated?: (tag: Tag) => void) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<ValidationFailures | null>(null);

  const { mutate, isPending } = useApiMutation<Tag, Pick<Tag, 'label'>>({
    path: '/tag',
    method: 'POST',
    mutationOptions: {
      onMutate: () => {
        setError(null);
      },
      onSuccess: (tag) => {
        queryClient.setQueryData<Tag[]>(TAGS_QUERY_KEY, (tags = []) =>
          tags.some((t) => t.id === tag.id)
            ? tags.map((t) => (t.id === tag.id ? tag : t))
            : [...tags, tag]
        );

        onTagCreated?.(tag);
      },
      onError: (err) => {
        setError(getValidationFailures(err));
      },
    },
  });

  return {
    addTag: mutate,
    isAddingTag: isPending,
    addTagError: error,
  };
};

export const useDeleteTag = (id: number) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useApiMutation<void, void>({
    path: `/tag/${id}`,
    method: 'DELETE',
    mutationOptions: {
      // Drop it from the list so the card goes away without waiting on a
      // round trip. Refetching both queries is SignalR's job -- the server
      // sends a tag sync for this, and invalidating here as well just fetched
      // /tag/detail twice.
      onSuccess: () => {
        queryClient.setQueryData<Tag[]>(TAGS_QUERY_KEY, (tags) =>
          tags?.filter((tag) => tag.id !== id)
        );
      },
    },
  });

  return {
    deleteTag: mutate,
    isDeletingTag: isPending,
    deleteTagError: error,
  };
};
