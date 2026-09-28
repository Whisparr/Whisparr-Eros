declare namespace MovieIndexSelectFooterModuleCssNamespace {
  export interface IMovieIndexSelectFooterModuleCss {
    actionButtons: string;
    buttons: string;
    footer: string;
    selected: string;
  }
}

declare const MovieIndexSelectFooterModuleCssModule: MovieIndexSelectFooterModuleCssNamespace.IMovieIndexSelectFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexSelectFooterModuleCssNamespace.IMovieIndexSelectFooterModuleCss;
};

export = MovieIndexSelectFooterModuleCssModule;
