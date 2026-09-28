declare namespace SelectMovieModalTableHeaderModuleCssNamespace {
  export interface ISelectMovieModalTableHeaderModuleCss {
    imdbId: string;
    performers: string;
    releaseDate: string;
    studioTitle: string;
    title: string;
    tmdbId: string;
  }
}

declare const SelectMovieModalTableHeaderModuleCssModule: SelectMovieModalTableHeaderModuleCssNamespace.ISelectMovieModalTableHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectMovieModalTableHeaderModuleCssNamespace.ISelectMovieModalTableHeaderModuleCss;
};

export = SelectMovieModalTableHeaderModuleCssModule;
