declare namespace TagDetailsModalContentCssNamespace {
  export interface ITagDetailsModalContentCss {
    deleteButton: string;
    item: string;
    items: string;
    restriction: string;
  }
}

declare const TagDetailsModalContentCssModule: TagDetailsModalContentCssNamespace.ITagDetailsModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TagDetailsModalContentCssNamespace.ITagDetailsModalContentCss;
};

export = TagDetailsModalContentCssModule;
