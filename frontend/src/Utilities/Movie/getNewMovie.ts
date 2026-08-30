export interface AddMovieOptions {
  rootFolderPath: string;
  monitored: boolean;
  qualityProfileId: number;
  tags: number[];
  searchForMovie?: boolean;
}

// Returns a copy rather than writing the add-time settings onto the movie it
// was handed. Callers pass a lookup result, which is React Query cache data
// shared with every other reader of that search; the old version mutated it
// and left each caller to remember a `cloneDeep` first.
function getNewMovie<T extends object>(movie: T, options: AddMovieOptions) {
  const {
    rootFolderPath,
    monitored,
    qualityProfileId,
    tags,
    searchForMovie = false,
  } = options;

  return {
    ...movie,
    addOptions: {
      monitored,
      searchForMovie,
    },
    monitored,
    qualityProfileId,
    rootFolderPath,
    tags,
  };
}

export default getNewMovie;
