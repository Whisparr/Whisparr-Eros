declare namespace EditMovieModalContentModuleCssNamespace {
  export interface IEditMovieModalContentModuleCss {
    deleteButton: string;
    tagInternalInput: string;
  }
}

declare const EditMovieModalContentModuleCssModule: EditMovieModalContentModuleCssNamespace.IEditMovieModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditMovieModalContentModuleCssNamespace.IEditMovieModalContentModuleCss;
};

export = EditMovieModalContentModuleCssModule;
