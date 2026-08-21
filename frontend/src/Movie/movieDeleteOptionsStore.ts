import { createPersist } from 'Helpers/createPersist';

interface MovieDeleteOptions {
  addImportExclusion: boolean;
}

// Replaces `persistState: ['movies.deleteOptions']` on the movies slice. It is
// its own store rather than a member of `movieIndexOptionsStore` because the
// delete modal is reached from movie details as well as the index, and Scene's
// copy of the modal will read the same options once it converts.
const movieDeleteOptionsStore = createPersist<MovieDeleteOptions>(
  'movie_delete_options',
  () => ({ addImportExclusion: false })
);

export const useMovieDeleteOptions = () => movieDeleteOptionsStore();

export const setMovieDeleteOption = <K extends keyof MovieDeleteOptions>(
  name: K,
  value: MovieDeleteOptions[K]
) => {
  movieDeleteOptionsStore.setState({ [name]: value } as Pick<
    MovieDeleteOptions,
    K
  >);
};
