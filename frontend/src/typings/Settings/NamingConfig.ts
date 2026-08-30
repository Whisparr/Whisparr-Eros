type ColonReplacementFormat =
  'delete' | 'dash' | 'spaceDash' | 'spaceDashSpace' | 'smart';

export default interface NamingConfig {
  // Sent back up on the examples request, which reads the config off the query
  // string and falls back to the saved one when the id is missing.
  id: number;
  renameMovies: boolean;
  renameScenes: boolean;
  replaceIllegalCharacters: boolean;
  colonReplacementFormat: ColonReplacementFormat;
  standardMovieFormat: string;
  movieFolderFormat: string;
  standardSceneFormat: string;
  sceneFolderFormat: string;
  sceneImportFolderFormat: string;
  maxFolderPathLength: number;
  maxFilePathLength: number;
}
