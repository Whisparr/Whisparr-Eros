declare namespace MovieIndexPosterModuleCssNamespace {
  export interface IMovieIndexPosterModuleCss {
    action: string;
    container: string;
    content: string;
    controls: string;
    deleted: string;
    editorSelect: string;
    externalLinks: string;
    link: string;
    nextAiring: string;
    overlayTitle: string;
    poster: string;
    posterContainer: string;
    tags: string;
    tagsList: string;
    title: string;
  }
}

declare const MovieIndexPosterModuleCssModule: MovieIndexPosterModuleCssNamespace.IMovieIndexPosterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexPosterModuleCssNamespace.IMovieIndexPosterModuleCss;
};

export = MovieIndexPosterModuleCssModule;
