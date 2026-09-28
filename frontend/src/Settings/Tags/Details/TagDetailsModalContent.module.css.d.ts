declare namespace TagDetailsModalContentModuleCssNamespace {
  export interface ITagDetailsModalContentModuleCss {
    deleteButton: string;
    item: string;
    items: string;
    restriction: string;
  }
}

declare const TagDetailsModalContentModuleCssModule: TagDetailsModalContentModuleCssNamespace.ITagDetailsModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagDetailsModalContentModuleCssNamespace.ITagDetailsModalContentModuleCss;
};

export = TagDetailsModalContentModuleCssModule;
