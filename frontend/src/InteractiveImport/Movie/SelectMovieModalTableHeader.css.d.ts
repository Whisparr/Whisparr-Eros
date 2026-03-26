declare namespace SelectMovieModalTableHeaderCssNamespace {
  export interface ISelectMovieModalTableHeaderCss {
    imdbId: string;
    performers: string;
    releaseDate: string;
    studioTitle: string;
    title: string;
    tmdbId: string;
  }
}

declare const SelectMovieModalTableHeaderCssModule: SelectMovieModalTableHeaderCssNamespace.ISelectMovieModalTableHeaderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectMovieModalTableHeaderCssNamespace.ISelectMovieModalTableHeaderCss;
};

export = SelectMovieModalTableHeaderCssModule;
