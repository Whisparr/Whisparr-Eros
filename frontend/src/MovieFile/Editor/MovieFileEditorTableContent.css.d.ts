declare namespace MovieFileEditorTableContentCssNamespace {
  export interface IMovieFileEditorTableContentCss {
    actions: string;
    blankpad: string;
    selectInput: string;
  }
}

declare const MovieFileEditorTableContentCssModule: MovieFileEditorTableContentCssNamespace.IMovieFileEditorTableContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieFileEditorTableContentCssNamespace.IMovieFileEditorTableContentCss;
};

export = MovieFileEditorTableContentCssModule;
