declare namespace EditMovieCollectionModalContentModuleCssNamespace {
  export interface IEditMovieCollectionModalContentModuleCss {
    container: string;
    info: string;
    overview: string;
    poster: string;
  }
}

declare const EditMovieCollectionModalContentModuleCssModule: EditMovieCollectionModalContentModuleCssNamespace.IEditMovieCollectionModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditMovieCollectionModalContentModuleCssNamespace.IEditMovieCollectionModalContentModuleCss;
};

export = EditMovieCollectionModalContentModuleCssModule;
