declare namespace MovieCreditPosterModuleCssNamespace {
  export interface IMovieCreditPosterModuleCss {
    action: string;
    container: string;
    content: string;
    controls: string;
    link: string;
    movieAction: string;
    overlayTitle: string;
    poster: string;
    posterContainer: string;
    title: string;
  }
}

declare const MovieCreditPosterModuleCssModule: MovieCreditPosterModuleCssNamespace.IMovieCreditPosterModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieCreditPosterModuleCssNamespace.IMovieCreditPosterModuleCss;
};

export = MovieCreditPosterModuleCssModule;
