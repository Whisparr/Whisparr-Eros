declare namespace NoMovieCssNamespace {
  export interface INoMovieCss {
    buttonContainer: string;
    message: string;
  }
}

declare const NoMovieCssModule: NoMovieCssNamespace.INoMovieCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NoMovieCssNamespace.INoMovieCss;
};

export = NoMovieCssModule;
