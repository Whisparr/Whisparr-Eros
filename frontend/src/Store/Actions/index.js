import * as addMovie from './addMovieActions';
import * as interactiveImportActions from './interactiveImportActions';
import * as movies from './movieActions';
import * as movieCredits from './movieCreditsActions';
import * as movieFiles from './movieFileActions';
import * as releases from './releaseActions';
import * as settings from './settingsActions';
import * as system from './systemActions';

export default [
  addMovie,
  movieFiles,
  interactiveImportActions,
  releases,
  movies,
  movieCredits,
  settings,
  system,
];
