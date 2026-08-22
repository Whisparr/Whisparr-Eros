import ModelBase from 'App/ModelBase';
import { Image } from 'Movie/Movie';

interface Performer extends ModelBase {
  foreignId: string;
  tmdbId?: number;
  tpdbId?: string;
  name: string;
  fullName: string;
  added: string;
  birthDate?: Date;
  age?: number;
  careerEnd?: number;
  careerStart?: number;
  ethnicity?: string;
  gender: string;
  country: string;
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
  searchOnAdd: boolean;
  sizeOnDisk: number;
  sortTitle: string;
  status: string;
  tags: number[];
  totalMovieCount: number;
  totalSceneCount: number;
}

export default Performer;
