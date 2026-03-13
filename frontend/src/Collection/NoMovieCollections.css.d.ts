declare namespace NoMovieCollectionsCssNamespace {
  export interface INoMovieCollectionsCss {
    buttonContainer: string;
    message: string;
  }
}

declare const NoMovieCollectionsCssModule: NoMovieCollectionsCssNamespace.INoMovieCollectionsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NoMovieCollectionsCssNamespace.INoMovieCollectionsCss;
};

export = NoMovieCollectionsCssModule;
