declare namespace MovieIndexPosterInfoCssNamespace {
  export interface IMovieIndexPosterInfoCss {
    info: string;
    tags: string;
    tagsList: string;
    title: string;
  }
}

declare const MovieIndexPosterInfoCssModule: MovieIndexPosterInfoCssNamespace.IMovieIndexPosterInfoCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexPosterInfoCssNamespace.IMovieIndexPosterInfoCss;
};

export = MovieIndexPosterInfoCssModule;
