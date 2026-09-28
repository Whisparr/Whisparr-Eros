declare namespace MovieIndexOverviewInfoModuleCssNamespace {
  export interface IMovieIndexOverviewInfoModuleCss {
    infos: string;
  }
}

declare const MovieIndexOverviewInfoModuleCssModule: MovieIndexOverviewInfoModuleCssNamespace.IMovieIndexOverviewInfoModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexOverviewInfoModuleCssNamespace.IMovieIndexOverviewInfoModuleCss;
};

export = MovieIndexOverviewInfoModuleCssModule;
