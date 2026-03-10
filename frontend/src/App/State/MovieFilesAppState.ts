import AppSectionState, {
  AppSectionDeleteState,
  TableAppSectionState,
} from 'App/State/AppSectionState';
import { MovieFile } from 'MovieFile/MovieFile';

interface MovieFilesAppState
  extends AppSectionState<MovieFile>,
    AppSectionDeleteState,
    TableAppSectionState {}

export default MovieFilesAppState;
