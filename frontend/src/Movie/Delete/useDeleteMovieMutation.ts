import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import { updateItem } from 'Store/Actions/baseActions';

interface DeleteMoviePayload {
  id: number;
  deleteFiles: boolean;
  addImportExclusion: boolean;
}

export function useDeleteMovieMutation(collectionTmdbId?: number) {
  const dispatch = useDispatch();

  // Collections are still Redux, so the missing-movie count they show has to be
  // nudged by hand -- there is no query to invalidate. This goes away with the
  // Collection conversion; it is the only reason this hook touches the store.
  const collection = useSelector((state: AppState) =>
    collectionTmdbId == null
      ? undefined
      : state.movieCollections.items.find((c) => c.tmdbId === collectionTmdbId)
  );

  const bumpCollectionMissingCount = useCallback(() => {
    if (!collection) {
      return;
    }

    // Skip updating if the last movie in the collection is being deleted
    if (collection.movies.length - collection.missingMovies === 1) {
      return;
    }

    dispatch(
      updateItem({
        section: 'movieCollections',
        ...collection,
        missingMovies: collection.missingMovies + 1,
      })
    );
  }, [collection, dispatch]);

  return useApiMutation<unknown, DeleteMoviePayload>({
    method: 'DELETE',
    path: ({ id, deleteFiles, addImportExclusion }) =>
      `/movie/${id}?deleteFiles=${deleteFiles}&addImportExclusion=${addImportExclusion}`,
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/movie/paged'] });

        bumpCollectionMissingCount();
      },
    },
  });
}
