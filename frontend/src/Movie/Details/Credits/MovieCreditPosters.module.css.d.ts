declare namespace MovieCreditPostersModuleCssNamespace {
  export interface IMovieCreditPostersModuleCss {
    container: string;
    grid: string;
    movie: string;
    sliderContainer: string;
  }
}

declare const MovieCreditPostersModuleCssModule: MovieCreditPostersModuleCssNamespace.IMovieCreditPostersModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieCreditPostersModuleCssNamespace.IMovieCreditPostersModuleCss;
};

export = MovieCreditPostersModuleCssModule;
