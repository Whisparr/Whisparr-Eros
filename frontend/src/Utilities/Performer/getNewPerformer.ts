export interface AddPerformerOptions {
  rootFolderPath: string;
  monitored: boolean;
  moviesMonitored: boolean;
  monitorNewItems: boolean;
  qualityProfileId: number;
  tags: number[];
  searchForMovie?: boolean;
}

// A copy, for the same reason as `getNewMovie`: the performer handed in is
// cache data from the lookup query.
function getNewPerformer<T extends object>(
  performer: T,
  options: AddPerformerOptions
) {
  const {
    rootFolderPath,
    monitored,
    moviesMonitored,
    monitorNewItems,
    qualityProfileId,
    tags,
    searchForMovie = false,
  } = options;

  return {
    ...performer,
    addOptions: {
      monitored,
      moviesMonitored,
      searchForMovie,
    },
    monitored,
    moviesMonitored,
    monitorNewItems,
    qualityProfileId,
    rootFolderPath,
    tags,
    searchOnAdd: searchForMovie,
  };
}

export default getNewPerformer;
