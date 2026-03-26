declare namespace MovieFileEditorTableCssNamespace {
  export interface IMovieFileEditorTableCss {
    container: string;
  }
}

declare const MovieFileEditorTableCssModule: MovieFileEditorTableCssNamespace.IMovieFileEditorTableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieFileEditorTableCssNamespace.IMovieFileEditorTableCss;
};

export = MovieFileEditorTableCssModule;
