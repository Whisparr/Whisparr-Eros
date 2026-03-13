declare namespace AddIndexerModalContentCssNamespace {
  export interface IAddIndexerModalContentCss {
    indexers: string;
  }
}

declare const AddIndexerModalContentCssModule: AddIndexerModalContentCssNamespace.IAddIndexerModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddIndexerModalContentCssNamespace.IAddIndexerModalContentCss;
};

export = AddIndexerModalContentCssModule;
