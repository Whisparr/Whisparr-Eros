declare namespace NoMovieCollectionsModuleCssNamespace {
  export interface INoMovieCollectionsModuleCss {
    buttonContainer: string;
    message: string;
  }
}

declare const NoMovieCollectionsModuleCssModule: NoMovieCollectionsModuleCssNamespace.INoMovieCollectionsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NoMovieCollectionsModuleCssNamespace.INoMovieCollectionsModuleCss;
};

export = NoMovieCollectionsModuleCssModule;
