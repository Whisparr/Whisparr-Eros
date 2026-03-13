declare namespace MovieCreditPosterCssNamespace {
  export interface IMovieCreditPosterCss {
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

declare const MovieCreditPosterCssModule: MovieCreditPosterCssNamespace.IMovieCreditPosterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieCreditPosterCssNamespace.IMovieCreditPosterCss;
};

export = MovieCreditPosterCssModule;
