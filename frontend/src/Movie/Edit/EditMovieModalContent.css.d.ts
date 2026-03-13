declare namespace EditMovieModalContentCssNamespace {
  export interface IEditMovieModalContentCss {
    deleteButton: string;
    tagInternalInput: string;
  }
}

declare const EditMovieModalContentCssModule: EditMovieModalContentCssNamespace.IEditMovieModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditMovieModalContentCssNamespace.IEditMovieModalContentCss;
};

export = EditMovieModalContentCssModule;
