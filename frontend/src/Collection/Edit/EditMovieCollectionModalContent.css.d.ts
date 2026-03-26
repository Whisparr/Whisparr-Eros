declare namespace EditMovieCollectionModalContentCssNamespace {
  export interface IEditMovieCollectionModalContentCss {
    container: string;
    info: string;
    overview: string;
    poster: string;
  }
}

declare const EditMovieCollectionModalContentCssModule: EditMovieCollectionModalContentCssNamespace.IEditMovieCollectionModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditMovieCollectionModalContentCssNamespace.IEditMovieCollectionModalContentCss;
};

export = EditMovieCollectionModalContentCssModule;
