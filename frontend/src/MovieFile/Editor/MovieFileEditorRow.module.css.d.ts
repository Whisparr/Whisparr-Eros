declare namespace MovieFileEditorRowModuleCssNamespace {
  export interface IMovieFileEditorRowModuleCss {
    actions: string;
    age: string;
    audio: string;
    audioLanguages: string;
    customFormatScore: string;
    dateAdded: string;
    download: string;
    formats: string;
    indexerFlags: string;
    language: string;
    languages: string;
    quality: string;
    rejected: string;
    relativePath: string;
    releaseGroup: string;
    size: string;
    subtitles: string;
    video: string;
    videoDynamicRangeType: string;
  }
}

declare const MovieFileEditorRowModuleCssModule: MovieFileEditorRowModuleCssNamespace.IMovieFileEditorRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieFileEditorRowModuleCssNamespace.IMovieFileEditorRowModuleCss;
};

export = MovieFileEditorRowModuleCssModule;
