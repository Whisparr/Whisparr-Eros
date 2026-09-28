declare namespace DeleteStudioModalModuleCssNamespace {
  export interface IDeleteStudioModalModuleCss {
    warningText: string;
  }
}

declare const DeleteStudioModalModuleCssModule: DeleteStudioModalModuleCssNamespace.IDeleteStudioModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DeleteStudioModalModuleCssNamespace.IDeleteStudioModalModuleCss;
};

export = DeleteStudioModalModuleCssModule;
