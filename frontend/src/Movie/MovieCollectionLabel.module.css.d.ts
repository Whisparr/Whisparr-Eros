declare namespace MovieCollectionLabelModuleCssNamespace {
  export interface IMovieCollectionLabelModuleCss {
    monitorToggleButton: string;
  }
}

declare const MovieCollectionLabelModuleCssModule: MovieCollectionLabelModuleCssNamespace.IMovieCollectionLabelModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieCollectionLabelModuleCssNamespace.IMovieCollectionLabelModuleCss;
};

export = MovieCollectionLabelModuleCssModule;
