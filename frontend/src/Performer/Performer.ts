import ModelBase from 'App/ModelBase';
import { Image } from 'Movie/Movie';
import Studio from 'Studio/Studio';

interface Performer extends ModelBase {
  foreignId: string;
  tmdbId?: number;
  tpdbId?: string;
  name: string;
  fullName: string;
  added: string;
  age?: number;
  careerEnd?: number;
  careerStart?: number;
  ethnicity?: string;
  gender: string;
  genres: string[];
  hairColor?: string;
  hasMovies: boolean;
  hasScenes: boolean;
  images: Image[];
  monitored: boolean;
  movieCount: number;
  moviesMonitored: boolean;
  qualityProfileId: number;
  rootFolderPath: string;
  sceneCount: number;
  sizeOnDisk: number;
  sortTitle: string;
  status: string;
  studios: Studio[];
  tags: number[];
  totalMovieCount: number;
  totalSceneCount: number;
}

export default Performer;
