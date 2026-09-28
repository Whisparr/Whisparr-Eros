declare namespace EditIndexerModalContentModuleCssNamespace {
  export interface IEditIndexerModalContentModuleCss {
    deleteButton: string;
  }
}

declare const EditIndexerModalContentModuleCssModule: EditIndexerModalContentModuleCssNamespace.IEditIndexerModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditIndexerModalContentModuleCssNamespace.IEditIndexerModalContentModuleCss;
};

export = EditIndexerModalContentModuleCssModule;
