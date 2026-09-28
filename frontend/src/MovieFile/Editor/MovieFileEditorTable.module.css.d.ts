declare namespace MovieFileEditorTableModuleCssNamespace {
  export interface IMovieFileEditorTableModuleCss {
    container: string;
  }
}

declare const MovieFileEditorTableModuleCssModule: MovieFileEditorTableModuleCssNamespace.IMovieFileEditorTableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieFileEditorTableModuleCssNamespace.IMovieFileEditorTableModuleCss;
};

export = MovieFileEditorTableModuleCssModule;
