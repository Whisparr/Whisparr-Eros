declare namespace MovieIndexOverviewInfoRowCssNamespace {
  export interface IMovieIndexOverviewInfoRowCss {
    icon: string;
    infoRow: string;
  }
}

declare const MovieIndexOverviewInfoRowCssModule: MovieIndexOverviewInfoRowCssNamespace.IMovieIndexOverviewInfoRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexOverviewInfoRowCssNamespace.IMovieIndexOverviewInfoRowCss;
};

export = MovieIndexOverviewInfoRowCssModule;
