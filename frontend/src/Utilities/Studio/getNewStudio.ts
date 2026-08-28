export interface AddStudioOptions {
  rootFolderPath: string;
  monitored: boolean;
  moviesMonitored: boolean;
  qualityProfileId: number;
  tags: number[];
  searchForMovie?: boolean;
}

// A copy, for the same reason as `getNewMovie`: the studio handed in is
// cache data from the lookup query.
function getNewStudio<T extends object>(studio: T, options: AddStudioOptions) {
  const {
    rootFolderPath,
    monitored,
    moviesMonitored,
    qualityProfileId,
    tags,
    searchForMovie = false,
  } = options;

  return {
    ...studio,
    addOptions: {
      monitored,
      moviesMonitored,
      searchForMovie,
    },
    monitored,
    moviesMonitored,
    qualityProfileId,
    rootFolderPath,
    tags,
    searchOnAdd: searchForMovie,
  };
}

export default getNewStudio;
