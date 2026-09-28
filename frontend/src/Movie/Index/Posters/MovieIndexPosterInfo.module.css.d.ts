declare namespace MovieIndexPosterInfoModuleCssNamespace {
  export interface IMovieIndexPosterInfoModuleCss {
    info: string;
    tags: string;
    tagsList: string;
    title: string;
  }
}

declare const MovieIndexPosterInfoModuleCssModule: MovieIndexPosterInfoModuleCssNamespace.IMovieIndexPosterInfoModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexPosterInfoModuleCssNamespace.IMovieIndexPosterInfoModuleCss;
};

export = MovieIndexPosterInfoModuleCssModule;
