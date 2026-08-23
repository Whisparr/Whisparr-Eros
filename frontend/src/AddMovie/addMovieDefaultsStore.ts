import { createPersist } from 'Helpers/createPersist';

export interface AddMovieDefaults {
  rootFolderPath: string;
  monitor: string;
  monitored: boolean;
  qualityProfileId: number;
  searchForMovie: boolean;
  tags: number[];
}

// Replaces `persistState: ['addMovie.movieDefaults']`. Shared by the add modal
// on Add New Movie/Scene and by the Import Movies footer, so whichever of the
// two you last set a root folder, monitor mode or quality profile in is what
// the other starts from.
const addMovieDefaultsStore = createPersist<AddMovieDefaults>(
  'add_movie_defaults',
  () => ({
    rootFolderPath: '',
    monitor: 'movieOnly',
    monitored: true,
    qualityProfileId: 0,
    searchForMovie: false,
    tags: [],
  })
);

export const useAddMovieDefaults = () => addMovieDefaultsStore();

export const setAddMovieDefault = <K extends keyof AddMovieDefaults>(
  name: K,
  value: AddMovieDefaults[K]
) => {
  addMovieDefaultsStore.setState({ [name]: value } as Pick<
    AddMovieDefaults,
    K
  >);
};
