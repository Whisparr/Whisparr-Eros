declare namespace SelectMovieRowCssNamespace {
  export interface ISelectMovieRowCss {
    cell: string;
    imdbId: string;
    performers: string;
    releaseDate: string;
    studioTitle: string;
    title: string;
    tmdbId: string;
  }
}

declare const SelectMovieRowCssModule: SelectMovieRowCssNamespace.ISelectMovieRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SelectMovieRowCssNamespace.ISelectMovieRowCss;
};

export = SelectMovieRowCssModule;
