declare namespace EditMoviesModalContentModuleCssNamespace {
  export interface IEditMoviesModalContentModuleCss {
    modalFooter: string;
    selected: string;
  }
}

declare const EditMoviesModalContentModuleCssModule: EditMoviesModalContentModuleCssNamespace.IEditMoviesModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditMoviesModalContentModuleCssNamespace.IEditMoviesModalContentModuleCss;
};

export = EditMoviesModalContentModuleCssModule;
