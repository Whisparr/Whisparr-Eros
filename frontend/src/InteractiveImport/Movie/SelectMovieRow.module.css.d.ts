declare namespace SelectMovieRowModuleCssNamespace {
  export interface ISelectMovieRowModuleCss {
    cell: string;
    imdbId: string;
    performers: string;
    releaseDate: string;
    studioTitle: string;
    title: string;
    tmdbId: string;
  }
}

declare const SelectMovieRowModuleCssModule: SelectMovieRowModuleCssNamespace.ISelectMovieRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectMovieRowModuleCssNamespace.ISelectMovieRowModuleCss;
};

export = SelectMovieRowModuleCssModule;
