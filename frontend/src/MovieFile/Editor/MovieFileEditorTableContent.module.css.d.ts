declare namespace MovieFileEditorTableContentModuleCssNamespace {
  export interface IMovieFileEditorTableContentModuleCss {
    actions: string;
    blankpad: string;
    selectInput: string;
  }
}

declare const MovieFileEditorTableContentModuleCssModule: MovieFileEditorTableContentModuleCssNamespace.IMovieFileEditorTableContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieFileEditorTableContentModuleCssNamespace.IMovieFileEditorTableContentModuleCss;
};

export = MovieFileEditorTableContentModuleCssModule;
