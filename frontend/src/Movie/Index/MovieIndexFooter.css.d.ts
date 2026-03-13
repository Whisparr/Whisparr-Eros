declare namespace MovieIndexFooterCssNamespace {
  export interface IMovieIndexFooterCss {
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

declare const MovieIndexFooterCssModule: MovieIndexFooterCssNamespace.IMovieIndexFooterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexFooterCssNamespace.IMovieIndexFooterCss;
};

export = MovieIndexFooterCssModule;
