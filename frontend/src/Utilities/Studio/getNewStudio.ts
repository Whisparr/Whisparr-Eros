export interface AddStudioOptions {
  rootFolderPath: string;
  monitored: boolean;
  moviesMonitored: boolean;
  whisparrMonitorNewItems: boolean;
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
    whisparrMonitorNewItems,
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
    whisparrMonitorNewItems,
    qualityProfileId,
    rootFolderPath,
    tags,
    searchOnAdd: searchForMovie,
  };
}

export default getNewStudio;
