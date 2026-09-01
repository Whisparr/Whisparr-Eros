import ModelBase from 'App/ModelBase';

export type CoverType = 'poster' | 'fanart' | 'screenshot' | 'clearlogo';

export interface Image {
  coverType: CoverType;
  url: string;
  remoteUrl: string;
}
interface Studio extends ModelBase {
  id: number;
  foreignId: string;
  tmdbId: number;
  tpdbId: string;
  title: string;
  afterDate?: string | null;
  aliases: string[];
  hasMovies: boolean;
  hasScenes: boolean;
  images: Image[];
  monitored: boolean;
  monitorNewItems: boolean;
  movieCount: number;
  moviesMonitored: boolean;
  network: string;
  qualityProfileId: number;
  rootFolderPath: string;
  sceneCount: number;
  searchOnAdd: boolean;
  searchTitle?: string;
  sizeOnDisk: number;
  sortTitle: string;
  tags: number[];
  totalMovieCount: number;
  totalSceneCount: number;
  website: string;
}

export default Studio;
