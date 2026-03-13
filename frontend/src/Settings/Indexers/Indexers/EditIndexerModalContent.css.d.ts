declare namespace EditIndexerModalContentCssNamespace {
  export interface IEditIndexerModalContentCss {
    deleteButton: string;
  }
}

declare const EditIndexerModalContentCssModule: EditIndexerModalContentCssNamespace.IEditIndexerModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditIndexerModalContentCssNamespace.IEditIndexerModalContentCss;
};

export = EditIndexerModalContentCssModule;
