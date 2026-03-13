declare namespace MovieIndexSelectFooterCssNamespace {
  export interface IMovieIndexSelectFooterCss {
    actionButtons: string;
    buttons: string;
    footer: string;
    selected: string;
  }
}

declare const MovieIndexSelectFooterCssModule: MovieIndexSelectFooterCssNamespace.IMovieIndexSelectFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexSelectFooterCssNamespace.IMovieIndexSelectFooterCss;
};

export = MovieIndexSelectFooterCssModule;
