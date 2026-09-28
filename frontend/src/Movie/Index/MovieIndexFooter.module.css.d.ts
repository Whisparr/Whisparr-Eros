declare namespace MovieIndexFooterModuleCssNamespace {
  export interface IMovieIndexFooterModuleCss {
    availNotMonitored: string;
    continuing: string;
    ended: string;
    footer: string;
    legendItem: string;
    legendItemColor: string;
    missingMonitored: string;
    missingUnmonitored: string;
    queue: string;
    statistics: string;
  }
}

declare const MovieIndexFooterModuleCssModule: MovieIndexFooterModuleCssNamespace.IMovieIndexFooterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexFooterModuleCssNamespace.IMovieIndexFooterModuleCss;
};

export = MovieIndexFooterModuleCssModule;
