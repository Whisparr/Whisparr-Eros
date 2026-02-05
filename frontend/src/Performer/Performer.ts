import ModelBase from 'App/ModelBase';
import { Image } from 'Movie/Movie';

interface Performer extends ModelBase {
  foreignId: string;
  tmdbId?: number;
  tpdbId?: string;
  name: string;
  fullName: string;
  aliases: string[];
  added: string;
  birthDate?: Date;
  deathDate?: Date;
  age?: number;
  careerEnd?: number;
  careerStart?: number;
  ethnicity?: string;
  gender: string;
  country: string;
  eyeColor?: string;
  hairColor?: string;
  height?: number;
  cupSize?: string;
  bandSize?: number;
  waistSize?: number;
  hipSize?: number;
  breastType: string;
  tattoos: string[];
  piercings: string[];
  images: Image[];
  status: string;
  hasMovies: boolean;
  hasScenes: boolean;
  monitored: boolean;
  movieCount: number;
  moviesMonitored: boolean;
  qualityProfileId: number;
  rootFolderPath: string;
  sceneCount: number;
  sizeOnDisk: number;
  sortTitle: string;
  tags: number[];
  totalMovieCount: number;
  totalSceneCount: number;
}

export default Performer;
