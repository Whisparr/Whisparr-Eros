declare namespace EditMoviesModalContentCssNamespace {
  export interface IEditMoviesModalContentCss {
    modalFooter: string;
    selected: string;
  }
}

declare const EditMoviesModalContentCssModule: EditMoviesModalContentCssNamespace.IEditMoviesModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditMoviesModalContentCssNamespace.IEditMoviesModalContentCss;
};

export = EditMoviesModalContentCssModule;
