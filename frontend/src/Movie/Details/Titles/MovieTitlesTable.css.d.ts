declare namespace MovieTitlesTableCssNamespace {
  export interface IMovieTitlesTableCss {
    blankpad: string;
    container: string;
  }
}

declare const MovieTitlesTableCssModule: MovieTitlesTableCssNamespace.IMovieTitlesTableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieTitlesTableCssNamespace.IMovieTitlesTableCss;
};

export = MovieTitlesTableCssModule;
