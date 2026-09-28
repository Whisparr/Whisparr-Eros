declare namespace MovieTitlesTableModuleCssNamespace {
  export interface IMovieTitlesTableModuleCss {
    blankpad: string;
    container: string;
  }
}

declare const MovieTitlesTableModuleCssModule: MovieTitlesTableModuleCssNamespace.IMovieTitlesTableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieTitlesTableModuleCssNamespace.IMovieTitlesTableModuleCss;
};

export = MovieTitlesTableModuleCssModule;
