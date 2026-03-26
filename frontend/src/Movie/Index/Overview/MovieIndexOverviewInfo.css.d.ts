declare namespace MovieIndexOverviewInfoCssNamespace {
  export interface IMovieIndexOverviewInfoCss {
    infos: string;
  }
}

declare const MovieIndexOverviewInfoCssModule: MovieIndexOverviewInfoCssNamespace.IMovieIndexOverviewInfoCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexOverviewInfoCssNamespace.IMovieIndexOverviewInfoCss;
};

export = MovieIndexOverviewInfoCssModule;
