declare namespace NoMovieModuleCssNamespace {
  export interface INoMovieModuleCss {
    buttonContainer: string;
    message: string;
  }
}

declare const NoMovieModuleCssModule: NoMovieModuleCssNamespace.INoMovieModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NoMovieModuleCssNamespace.INoMovieModuleCss;
};

export = NoMovieModuleCssModule;
