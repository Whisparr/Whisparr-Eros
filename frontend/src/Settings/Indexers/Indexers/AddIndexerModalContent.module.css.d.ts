declare namespace AddIndexerModalContentModuleCssNamespace {
  export interface IAddIndexerModalContentModuleCss {
    indexers: string;
  }
}

declare const AddIndexerModalContentModuleCssModule: AddIndexerModalContentModuleCssNamespace.IAddIndexerModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddIndexerModalContentModuleCssNamespace.IAddIndexerModalContentModuleCss;
};

export = AddIndexerModalContentModuleCssModule;
