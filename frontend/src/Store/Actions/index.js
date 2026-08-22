import * as addMovie from './addMovieActions';
import * as addPerformer from './addPerformerActions';
import * as interactiveImportActions from './interactiveImportActions';
import * as movies from './movieActions';
import * as movieCollections from './movieCollectionActions';
import * as movieCredits from './movieCreditsActions';
import * as movieFiles from './movieFileActions';
import * as performerScenes from './performerScenesActions';
import * as releases from './releaseActions';
import * as settings from './settingsActions';
import * as system from './systemActions';

export default [
  addMovie,
  addPerformer,
  movieFiles,
  interactiveImportActions,
  releases,
  movies,
  movieCollections,
  movieCredits,
  performerScenes,
  settings,
  system,
];
