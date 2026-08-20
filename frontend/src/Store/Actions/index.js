import * as addMovie from './addMovieActions';
import * as addPerformer from './addPerformerActions';
import * as app from './appActions';
import * as captcha from './captchaActions';
import * as interactiveImportActions from './interactiveImportActions';
import * as movies from './movieActions';
import * as movieCollections from './movieCollectionActions';
import * as movieCredits from './movieCreditsActions';
import * as movieFiles from './movieFileActions';
import * as movieIndex from './movieIndexActions';
import * as oAuth from './oAuthActions';
import * as paths from './pathActions';
import * as performers from './performerActions';
import * as performerScenes from './performerScenesActions';
import * as providerOptions from './providerOptionActions';
import * as releases from './releaseActions';
import * as sceneIndex from './sceneIndexActions';
import * as settings from './settingsActions';
import * as studios from './studioActions';
import * as studioScenes from './studioScenesActions';
import * as system from './systemActions';

export default [
  addMovie,
  addPerformer,
  app,
  captcha,
  movieFiles,
  interactiveImportActions,
  oAuth,
  paths,
  providerOptions,
  releases,
  movies,
  movieCollections,
  movieCredits,
  movieIndex,
  performers,
  performerScenes,
  sceneIndex,
  settings,
  studios,
  studioScenes,
  system,
];
