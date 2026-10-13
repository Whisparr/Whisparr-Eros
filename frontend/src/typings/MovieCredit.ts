import ModelBase from 'App/ModelBase';
import { Image } from 'Movie/Movie';

export type MovieCreditType = 'cast' | 'crew';

interface MovieCredit extends ModelBase {
  foreignId: string;
  performerId: number;
  personName: string;
  images: Image[];
  type: MovieCreditType;
  department: string;
  job: string;
  character: string;
  order: number;
  canMonitor: boolean;
  monitored: boolean;
  canMovieMonitor: boolean;
  moviesMonitored: boolean;
  performerHidden: boolean;
}

export default MovieCredit;
