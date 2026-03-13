declare namespace MovieCollectionLabelCssNamespace {
  export interface IMovieCollectionLabelCss {
    monitorToggleButton: string;
  }
}

declare const MovieCollectionLabelCssModule: MovieCollectionLabelCssNamespace.IMovieCollectionLabelCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieCollectionLabelCssNamespace.IMovieCollectionLabelCss;
};

export = MovieCollectionLabelCssModule;
