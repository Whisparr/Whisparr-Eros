import useApiQuery from 'Helpers/Hooks/useApiQuery';

export interface QualityProfileStatistics {
  qualityProfileId: number;
  name: string;
  movieCount: number;
  movieFileCount: number;
  sizeOnDisk: number;
}

export interface QualityStatistics {
  quality: { id: number; name: string };
  movieFileCount: number;
  sizeOnDisk: number;
}

export interface TagStatistics {
  tagId: number;
  label: string;
  movieCount: number;
  movieFileCount: number;
  sizeOnDisk: number;
}

export interface StudioStatistics {
  studioForeignId: string;
  title: string;
  movieCount: number;
  movieFileCount: number;
  sizeOnDisk: number;
}

export interface PerformerStatistics {
  performerForeignId: string;
  name: string;
  movieCount: number;
  movieFileCount: number;
  sizeOnDisk: number;
}

export interface Statistics {
  movieCount: number;
  monitoredMovieCount: number;
  downloadedMovieCount: number;
  missingMovieCount: number;
  unreleasedMovieCount: number;
  tbaMovieCount: number;
  announcedMovieCount: number;
  inCinemasMovieCount: number;
  releasedMovieCount: number;
  deletedMovieCount: number;
  movieItemCount: number;
  sceneItemCount: number;
  movieFileCount: number;
  sizeOnDisk: number;
  qualityProfiles: QualityProfileStatistics[];
  qualities: QualityStatistics[];
  tags: TagStatistics[];
  studios: StudioStatistics[];
  performers: PerformerStatistics[];
}

const useStatistics = () => {
  return useApiQuery<Statistics>({
    path: '/statistics',
    // The whole page is one request and the numbers only move on import or
    // refresh, so a short stale window avoids refetching on every navigation.
    queryOptions: { staleTime: 60 * 1000 },
  });
};

export default useStatistics;
