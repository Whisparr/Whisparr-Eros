declare namespace DeleteStudioModalCssNamespace {
  export interface IDeleteStudioModalCss {
    warningText: string;
  }
}

declare const DeleteStudioModalCssModule: DeleteStudioModalCssNamespace.IDeleteStudioModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteStudioModalCssNamespace.IDeleteStudioModalCss;
};

export = DeleteStudioModalCssModule;
