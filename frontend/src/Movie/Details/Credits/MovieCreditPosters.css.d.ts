declare namespace MovieCreditPostersCssNamespace {
  export interface IMovieCreditPostersCss {
    container: string;
    grid: string;
    movie: string;
    sliderContainer: string;
  }
}

declare const MovieCreditPostersCssModule: MovieCreditPostersCssNamespace.IMovieCreditPostersCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieCreditPostersCssNamespace.IMovieCreditPostersCss;
};

export = MovieCreditPostersCssModule;
